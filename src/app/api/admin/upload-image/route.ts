import { NextResponse } from 'next/server';
import { isRequestAuthorized } from '@/lib/adminAuth';
import { resolveGitHubToken, commitFileToGitHub } from '@/lib/githubSync';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign into the owner portal.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const target = (formData.get('target') as string | null) || 'general'; // 'profile' | 'about' | 'projects' | 'general'

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate mime type
    const validMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    if (!validMimes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a JPG, PNG, WebP, GIF, or SVG.' },
        { status: 400 }
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum image size is 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension
    const originalExt = path.extname(file.name).toLowerCase() || '.jpg';

    let subPath = '';
    let publicUrl = '';

    if (target === 'profile') {
      subPath = 'profile.jpg';
      publicUrl = `/profile.jpg?v=${Date.now()}`;
    } else if (target === 'about') {
      subPath = 'about.jpg';
      publicUrl = `/about.jpg?v=${Date.now()}`;
    } else if (target === 'projects') {
      const sanitized = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const filename = `${Date.now()}-${sanitized}`;
      subPath = path.join('projects', filename);
      publicUrl = `/projects/${filename}`;
    } else {
      const sanitized = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const filename = `${Date.now()}-${sanitized}`;
      subPath = path.join('uploads', filename);
      publicUrl = `/uploads/${filename}`;
    }

    const relativeFilePath = `public/${subPath.replace(/\\/g, '/')}`;

    // 1. If Supabase Storage is configured, upload to Supabase bucket
    if (isSupabaseConfigured && supabase) {
      const storagePath = subPath.replace(/\\/g, '/');
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(storagePath);
        if (publicUrlData?.publicUrl) {
          publicUrl = publicUrlData.publicUrl;
        }
      }
    }

    // 2. Write to local filesystem (dev / persistent environments)
    try {
      const fullPath = path.join(process.cwd(), 'public', subPath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(fullPath, buffer);
    } catch (fsErr) {
      console.warn('Local filesystem write notice (expected on Vercel):', fsErr);
    }

    // 3. GitHub auto-commit if token configured
    const token = await resolveGitHubToken(req);
    if (token) {
      try {
        const commitRes = await commitFileToGitHub(
          relativeFilePath,
          buffer,
          `chore(media): upload ${relativeFilePath.replace(/^public\//, '')} from admin portal`,
          token
        );
        if (!commitRes.success) {
          console.warn('GitHub image commit warning:', commitRes.error);
        }
      } catch (ghErr) {
        console.warn('GitHub image commit failed:', ghErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      target,
      message: `Image successfully uploaded!`,
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
