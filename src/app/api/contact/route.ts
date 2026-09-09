import { NextResponse } from 'next/server';

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

    // --- Send via Nodemailer (SMTP) ---
    const smtpUser = (process.env.SMTP_USER || 'emmanueledward303@gmail.com').trim();
    const rawPass = process.env.SMTP_PASS || 'ymoj wlup pgis bzli';
    const smtpPass = rawPass.replace(/\s+/g, '');

    if (smtpUser && smtpPass) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Edward Emmanuel Portfolio" <${smtpUser}>`,
        to: 'emmanueledward303@gmail.com',
        replyTo: email,
        subject: `💼 New Portfolio Inquiry from ${name}`,
        text: `You received a new contact message from your portfolio website:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1.5px solid #DAC98B; border-radius: 8px; background-color: #FDFBF7;">
            <div style="border-bottom: 2px solid #4B2E21; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #4B2E21; margin: 0; font-size: 20px;">New Portfolio Website Message</h2>
              <span style="font-size: 13px; color: #6C4A3B;">Received via edward-emmanuel portfolio</span>
            </div>
            
            <p style="font-size: 15px; color: #3C241A; line-height: 1.6; margin: 0 0 16px;">
              <strong>Sender Name:</strong> ${name}<br/>
              <strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #4B2E21; font-weight: 600;">${email}</a>
            </p>
            
            <div style="margin: 20px 0; padding: 18px; background-color: #F2E6B3; border-left: 4px solid #4B2E21; border-radius: 4px;">
              <p style="margin: 0; color: #3C241A; white-space: pre-wrap; font-size: 15px; line-height: 1.7;">${message}</p>
            </div>
            
            <p style="font-size: 12px; color: #6C4A3B; margin-top: 24px; border-top: 1px solid #DAC98B; padding-top: 12px;">
              💡 <em>Tip: You can hit &ldquo;Reply&rdquo; in your email client to reply directly to ${name} (${email}).</em>
            </p>
          </div>
        `,
      });

      return NextResponse.json({ ok: true });
    }

    console.warn('[Contact API] SMTP credentials not configured.');
    return NextResponse.json(
      { error: 'Email delivery is currently being configured. Please contact directly at emmanueledward303@gmail.com' },
      { status: 503 }
    );
  } catch (err: any) {
    console.error('[Contact API error]', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to deliver message. Please try again.' },
      { status: 500 }
    );
  }
}
