import { storage } from '../server/storage';

// Helper function to handle CORS
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Helper function to handle errors
export function handleError(error: unknown) {
  console.error('API Error:', error);
  return {
    statusCode: 500,
    headers: corsHeaders(),
    body: JSON.stringify({ error: 'Internal server error' })
  };
}

// Helper function to parse JSON body
export async function parseBody(req: any) {
  if (req.body && typeof req.body === 'string') {
    return JSON.parse(req.body);
  }
  return req.body;
}

export { storage };
