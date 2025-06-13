import { NextRequest } from 'next/server';
import app from '@/api/edge-functions';

export async function POST(request: NextRequest) {
  return app.fetch(request);
}