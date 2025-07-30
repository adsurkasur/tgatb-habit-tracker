import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Habit ID is required' });
      }
      
      const logs = await storage.getLogsByHabit(id);
      return res.status(200).json(logs);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error fetching habit logs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
