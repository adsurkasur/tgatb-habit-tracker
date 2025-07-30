import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { id } = req.query;
      const { completed } = req.body;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Habit ID is required' });
      }
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed status is required' });
      }
      
      const log = await storage.createLog(id, completed);
      return res.status(201).json(log);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error tracking habit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
