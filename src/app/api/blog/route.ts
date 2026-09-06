import { NextResponse } from 'next/server';
import { isRequestAuthorized } from '@/lib/adminAuth';
import { getBlogPosts, createBlogPost, deleteBlogPost } from '@/lib/db';

export type { BlogPost } from '@/lib/db';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(req: Request) {
  try {
    const posts = await getBlogPosts(req);
    return NextResponse.json(posts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged into the admin dashboard.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, excerpt, content, date, read_time } = body;

    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Title, excerpt, and content are required.' },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);
    const postDate =
      date?.trim() ||
      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const postReadTime = read_time?.trim() || '3 min read';

    const newPost = await createBlogPost(
      {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        date: postDate,
        read_time: postReadTime,
        slug,
      },
      req
    );

    return NextResponse.json(newPost, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create post' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in as admin.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required.' }, { status: 400 });
    }

    const result = await deleteBlogPost(id, req);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete post' }, { status: 500 });
  }
}
