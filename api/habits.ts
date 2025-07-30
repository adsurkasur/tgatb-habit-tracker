import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createApiRoutes } from '../server/api-routes';

const app = express();
app.use(express.json());
app.use('/api', createApiRoutes());

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rewrite URL to match our express routes
  req.url = '/api/habits';

  return new Promise((resolve) => {
    app(req as any, res as any, () => {
      resolve(undefined);
    });
  });
}
