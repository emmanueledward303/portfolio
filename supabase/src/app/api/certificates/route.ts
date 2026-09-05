import { NextResponse } from 'next/server';
import { getCertificates } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const certs = await getCertificates();
  return NextResponse.json(certs);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, issuer, issue_date, description } = body;

    if (!title || !issuer || !issue_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('certificates')
        .insert([{ title, issuer, issue_date, description }])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data, { status: 201 });
    }

    // Fallback response for unconfigured environment
    return NextResponse.json(
      {
        id: `cert-${Date.now()}`,
        title,
        issuer,
        issue_date,
        description,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
