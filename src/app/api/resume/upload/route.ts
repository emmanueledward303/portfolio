import { NextResponse } from 'next/server';
import { getResumeMeta, setRuntimeResumeMeta, setRuntimeResumeBuffer, ResumeMeta } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isRequestAuthorized } from '@/lib/adminAuth';
import { resolveGitHubToken, commitFileToGitHub } from '@/lib/githubSync';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  const meta = await getResumeMeta(req);
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
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed (.pdf)' }, { status: 400 });
    }

    // 10MB limit check
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum PDF resume size is 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name || 'Edward_Emmanuel_Resume.pdf';
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // 1. Cache buffer in memory for instant serving
    setRuntimeResumeBuffer(buffer);

    let activeFileUrl = `/api/resume/download?v=${Date.now()}`;

    // 2. If Supabase is connected, attempt storage upload gracefully
    if (isSupabaseConfigured && supabase) {
      try {
        const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `resumes/${Date.now()}-${sanitized}`;
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(storagePath, buffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('resumes')
            .getPublicUrl(storagePath);

          if (publicUrlData?.publicUrl) {
            activeFileUrl = publicUrlData.publicUrl;
          }

          // Try updating resume_meta database table
          try {
            await supabase
              .from('resume_meta')
              .insert([{ file_url: activeFileUrl, file_name: fileName, last_updated: formattedDate }]);
          } catch (dbErr) {
            console.warn('Supabase resume_meta insert warning:', dbErr);
          }
        } else {
          console.warn('Supabase resume upload failed, falling back to local/GitHub:', uploadError.message);
        }
      } catch (sbErr: any) {
        console.warn('Supabase connection/fetch error during resume upload, falling back:', sbErr?.message);
      }
    }

    // 3. Write locally to data/resume.pdf and public/resume.pdf
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      await fs.promises.writeFile(path.join(dataDir, 'resume.pdf'), buffer);
    } catch (dataWriteErr) {
      console.warn('Local data/resume.pdf write notice:', dataWriteErr);
    }

    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      await fs.promises.writeFile(path.join(publicDir, 'resume.pdf'), buffer);
    } catch {
      // Expected on read-only serverless lambdas (Vercel)
    }

    // 4. Update runtime metadata & local data/resume.json
    const updatedMeta: ResumeMeta = {
      file_url: activeFileUrl,
      file_name: fileName,
      last_updated: formattedDate,
    };
    await setRuntimeResumeMeta(updatedMeta);

    // 5. If GitHub token is present, commit files directly to GitHub
    const token = await resolveGitHubToken(req);
    if (token) {
      // Commit resume.pdf
      const commitPdfRes = await commitFileToGitHub(
        'public/resume.pdf',
        buffer,
        `chore(resume): update official PDF resume from admin portal`,
        token
      );
      if (!commitPdfRes.success) {
        console.warn('GitHub resume.pdf commit warning:', commitPdfRes.error);
      }

      // Also commit data/resume.json for persistence
      const commitJsonRes = await commitFileToGitHub(
        'data/resume.json',
        JSON.stringify(updatedMeta, null, 2),
        `chore(resume): update resume metadata from admin portal`,
        token
      );
      if (!commitJsonRes.success) {
        console.warn('GitHub resume.json commit warning:', commitJsonRes.error);
      }
    }

    return NextResponse.json({
      success: true,
      ...updatedMeta,
    });

  } catch (err: any) {
    console.error('Resume upload error:', err);
    return NextResponse.json(
      { error: err?.message || 'Resume upload failed on server.' },
      { status: 500 }
    );
  }
}
