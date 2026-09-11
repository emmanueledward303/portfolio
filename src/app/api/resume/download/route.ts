import { getResumeMeta, getRuntimeResumeBuffer } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get('download') === '1';

    const meta = await getResumeMeta(req);
    const fileName = meta.file_name || 'Edward_Emmanuel_Resume.pdf';

    // 1. Check in-memory buffer (fastest & works during same lambda lifecycle)
    let buffer: Buffer | null = getRuntimeResumeBuffer();

    // 2. Check data/resume.pdf
    if (!buffer) {
      try {
        const dataPath = path.join(process.cwd(), 'data', 'resume.pdf');
        if (fs.existsSync(dataPath)) {
          buffer = await fs.promises.readFile(dataPath);
        }
      } catch {
        // Fall through
      }
    }

    // 3. Check public/resume.pdf
    if (!buffer) {
      try {
        const publicPath = path.join(process.cwd(), 'public', 'resume.pdf');
        if (fs.existsSync(publicPath)) {
          const pubBuf = await fs.promises.readFile(publicPath);
          // Ensure it's a valid PDF (not an empty or corrupted placeholder)
          if (pubBuf.length > 50 && pubBuf.subarray(0, 4).toString() === '%PDF') {
            buffer = pubBuf;
          }
        }
      } catch {
        // Fall through
      }
    }

    // 4. If Supabase is configured and file_url is a remote URL, redirect or stream
    if (!buffer && isSupabaseConfigured && supabase && meta.file_url && meta.file_url.startsWith('http')) {
      return Response.redirect(meta.file_url, 302);
    }

    // 5. If still no buffer, generate clean fallback PDF
    if (!buffer) {
      buffer = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 72 >>\nstream\nBT\n/F1 18 Tf\n50 720 Td\n(Edward Emmanuel - Curriculum Vitae) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000227 00000 n \n0000000298 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n421\n%%EOF\n'
      );
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Length', String(buffer.length));
    headers.set(
      'Content-Disposition',
      `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(fileName)}"`
    );
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('Error streaming resume download:', err);
    return new Response('Failed to load resume document.', { status: 500 });
  }
}
