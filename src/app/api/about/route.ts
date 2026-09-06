import { NextResponse } from 'next/server';
import { isRequestAuthorized } from '@/lib/adminAuth';
import { getAboutData, updateAboutData, AboutData } from '@/lib/db';

export type { AboutData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getAboutData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch about data' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign into the owner portal.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { heading, paragraphs, facts, eyebrow } = body;

    if (!heading?.trim()) {
      return NextResponse.json(
        { error: 'A headline/heading is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(paragraphs) || paragraphs.length === 0 || !paragraphs.some((p: string) => p.trim())) {
      return NextResponse.json(
        { error: 'At least one bio paragraph is required.' },
        { status: 400 }
      );
    }

    const updated = await updateAboutData(
      {
        eyebrow: eyebrow?.trim() || 'About Me',
        heading: heading.trim(),
        paragraphs: paragraphs.map((p: string) => p.trim()).filter(Boolean),
        facts: Array.isArray(facts)
          ? facts.filter((f: any) => f && f.label && f.value)
          : undefined,
      },
      req
    );

    return NextResponse.json({
      success: true,
      message: 'About Me profile updated successfully!',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update about data' },
      { status: 500 }
    );
  }
}
