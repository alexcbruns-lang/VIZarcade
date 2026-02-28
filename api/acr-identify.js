// /api/acr-identify.js — Vercel Serverless Function
// Proxies audio snippets to ACRCloud for song identification
// Keeps API credentials server-side (env vars)

import crypto from 'crypto';

export const config = {
  maxDuration: 10, // 10s timeout (recognition is fast)
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ACR_HOST, ACR_ACCESS_KEY, ACR_ACCESS_SECRET } = process.env;

  if (!ACR_HOST || !ACR_ACCESS_KEY || !ACR_ACCESS_SECRET) {
    console.error('[acr-identify] Missing environment variables');
    return res.status(500).json({ error: 'ACRCloud not configured' });
  }

  try {
    const { audio } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'Missing audio data' });
    }

    // Decode base64 audio
    const audioBuffer = Buffer.from(audio, 'base64');
    const audioSize = audioBuffer.length;

    // Build ACRCloud signature
    // Signature = base64(HMAC-SHA1(access_secret, stringToSign))
    const httpMethod = 'POST';
    const httpUri = '/v1/identify';
    const dataType = 'audio';
    const signatureVersion = '1';
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const stringToSign = [
      httpMethod, httpUri, ACR_ACCESS_KEY,
      dataType, signatureVersion, timestamp
    ].join('\n');

    const signature = crypto
      .createHmac('sha1', ACR_ACCESS_SECRET)
      .update(stringToSign, 'utf-8')
      .digest('base64');

    // Build multipart form data
    const boundary = '----VIZarcade' + Date.now();
    const parts = [];

    const addField = (name, value) => {
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
        `${value}\r\n`
      );
    };

    addField('access_key', ACR_ACCESS_KEY);
    addField('data_type', dataType);
    addField('signature_version', signatureVersion);
    addField('signature', signature);
    addField('sample_bytes', audioSize.toString());
    addField('timestamp', timestamp);

    // Add audio file part
    const fileHeader =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="sample"; filename="audio.webm"\r\n` +
      `Content-Type: audio/webm\r\n\r\n`;
    const fileFooter = `\r\n--${boundary}--\r\n`;

    // Combine all parts into a single buffer
    const textParts = Buffer.from(parts.join(''), 'utf-8');
    const headerBuf = Buffer.from(fileHeader, 'utf-8');
    const footerBuf = Buffer.from(fileFooter, 'utf-8');
    const body = Buffer.concat([textParts, headerBuf, audioBuffer, footerBuf]);

    // Send to ACRCloud
    const acrUrl = `https://${ACR_HOST}/v1/identify`;
    const acrResponse = await fetch(acrUrl, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length.toString(),
      },
      body: body,
    });

    if (!acrResponse.ok) {
      console.error('[acr-identify] ACRCloud returned', acrResponse.status);
      return res.status(502).json({ error: 'ACRCloud request failed', status: acrResponse.status });
    }

    const result = await acrResponse.json();

    // Log for debugging (Vercel function logs)
    if (result.status && result.status.code === 0 && result.metadata?.music?.length > 0) {
      const m = result.metadata.music[0];
      console.log(`[acr-identify] Recognized: ${m.title} — ${(m.artists || []).map(a => a.name).join(', ')}`);
    } else {
      console.log('[acr-identify] No match. Status:', result.status?.msg || 'unknown');
    }

    return res.status(200).json(result);

  } catch (e) {
    console.error('[acr-identify] Error:', e);
    return res.status(500).json({ error: 'Internal error', message: e.message });
  }
}
