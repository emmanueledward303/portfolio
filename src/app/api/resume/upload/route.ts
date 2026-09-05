import { NextResponse } from 'next/server';
import { getResumeMeta, setRuntimeResumeMeta } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isRequestAuthorized } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const meta = await getResumeMeta();
  return NextResponse.json(meta);
}

export async function POST(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged into the admin dashboard to upload a resume.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name || 'resume.pdf';
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // If Supabase is connected, store in Supabase Storage and DB
    if (isSupabaseConfigured && supabase) {
      const storagePath = `resumes/${Date.now()}-${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(storagePath, buffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(storagePath);

      const fileUrl = publicUrlData.publicUrl;

      // Update resume metadata in database
      const { data: dbData, error: dbError } = await supabase
        .from('resume_meta')
        .insert([{ file_url: fileUrl, file_name: fileName, last_updated: now.toISOString() }])
        .select()
        .single();

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        file_url: fileUrl,
        file_name: fileName,
        last_updated: formattedDate,
      });
    }

    // Local fallback: write to public/resume.pdf so downloads immediately reflect new file
    const publicDir = path.join(process.cwd(), 'public');
    const targetPath = path.join(publicDir, 'resume.pdf');
    await fs.promises.writeFile(targetPath, buffer);

    const updated = await setRuntimeResumeMeta({
      file_url: '/resume.pdf',
      file_name: fileName,
      last_updated: formattedDate,
    });

    return NextResponse.json({
      success: true,
      ...updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
