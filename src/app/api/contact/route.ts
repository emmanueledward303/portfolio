import { NextResponse } from 'next/server';
import { isRequestAuthorized } from '@/lib/adminAuth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // --- Send via Nodemailer (SMTP) if credentials are set ---
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"Portfolio Contact" <${smtpUser}>`,
        to: 'emmanueledward303@gmail.com',
        replyTo: email,
        subject: `Portfolio message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `
          <h2 style="font-family:sans-serif;color:#4B2E21">New message from your portfolio</h2>
          <p style="font-family:sans-serif"><strong>Name:</strong> ${name}</p>
          <p style="font-family:sans-serif"><strong>Email:</strong> ${email}</p>
          <hr/>
          <p style="font-family:sans-serif;white-space:pre-wrap">${message}</p>
        `,
      });

      return NextResponse.json({ ok: true });
    }

    // --- Fallback: log to console in dev / return success anyway ---
    // In production without SMTP, messages are acknowledged but not emailed.
    console.log('[Contact Form]', { name, email, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Contact API]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
