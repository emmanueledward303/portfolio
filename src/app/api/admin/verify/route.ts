import { NextResponse } from 'next/server';
import { isRequestAuthorized } from '@/lib/adminAuth';

export async function GET(req: Request) {
  const authorized = await isRequestAuthorized(req);
  return NextResponse.json({ authenticated: authorized });
}
