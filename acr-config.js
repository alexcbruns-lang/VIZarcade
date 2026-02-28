// /api/acr-config.js — Vercel Serverless Function
// Returns whether ACRCloud is configured (no secrets exposed)

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const configured = !!(
    process.env.ACR_HOST &&
    process.env.ACR_ACCESS_KEY &&
    process.env.ACR_ACCESS_SECRET
  );

  return res.status(200).json({
    enabled: configured,
    proxyUrl: '/api/acr-identify',
  });
}
