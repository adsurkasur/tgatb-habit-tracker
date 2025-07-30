import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  try {
    if (req.method === 'GET') {
      const settings = await storage.getSettings();
      return res.status(200).setHeader('Access-Control-Allow-Origin', '*').json(settings);
    }

    if (req.method === 'PUT') {
      await storage.updateSettings(req.body);
      return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
        .json({ success: true });
    }

    return res.status(405).setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in settings API:', error);
    return res.status(500).setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Internal server error' });
  }
}
