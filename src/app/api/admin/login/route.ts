import { NextResponse } from 'next/server';
import { validateAdminPassword, createSessionToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (!validateAdminPassword(password)) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });

    // Set secure HTTP-only cookie
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}
