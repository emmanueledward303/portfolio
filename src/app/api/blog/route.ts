import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isRequestAuthorized } from '@/lib/adminAuth';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  read_time: string;
  slug: string;
  created_at?: string;
}

// In-memory fallback for when Supabase is not configured
const inMemoryPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Bridging Data Analytics with Scalable Web Systems',
    excerpt: 'How treating data pipelines with software engineering rigor leads to more reliable business intelligence and faster decision-making.',
    content: `In modern tech teams, data analysis and software engineering often live in separate silos. Analysts work in SQL notebooks, while software engineers build production APIs and UIs.

However, the real magic happens when data pipelines are treated with the exact same engineering standards: version-controlled schemas, automated validations, and clear API boundaries.

By designing responsive frontend dashboards connected directly to well-modeled data systems, we eliminate guesswork and give stakeholders confidence in every metric they see.`,
    date: 'August 2024',
    read_time: '4 min read',
    slug: 'bridging-data-analytics-with-scalable-web-systems',
    created_at: new Date().toISOString(),
  },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data ?? []);
    }

    // In-memory fallback
    return NextResponse.json(inMemoryPosts);
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

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{ title: title.trim(), excerpt: excerpt.trim(), content: content.trim(), date: postDate, read_time: postReadTime, slug }])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 201 });
    }

    // In-memory fallback
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      date: postDate,
      read_time: postReadTime,
      slug,
      created_at: new Date().toISOString(),
    };
    inMemoryPosts.unshift(newPost);
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

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Post deleted successfully.' });
    }

    // In-memory fallback
    const idx = inMemoryPosts.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }
    inMemoryPosts.splice(idx, 1);
    return NextResponse.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete post' }, { status: 500 });
  }
}
