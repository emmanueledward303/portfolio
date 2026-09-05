import { NextResponse } from 'next/server';
import { getTechStack } from '@/lib/db';

export async function GET() {
  const techStack = await getTechStack();
  return NextResponse.json(techStack);
}
