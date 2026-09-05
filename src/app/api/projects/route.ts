import { NextResponse } from 'next/server';
import { getProjects, createProject, deleteProject, updateProject } from '@/lib/db';
import { isRequestAuthorized } from '@/lib/adminAuth';

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged into the admin dashboard to upload projects.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, category, tech_stack, tagline, demo_url, github_url, image_url, featured } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const formattedTechStack = Array.isArray(tech_stack)
      ? tech_stack
      : typeof tech_stack === 'string'
      ? tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const newProject = await createProject({
      title: title.trim(),
      tagline: tagline?.trim() || '',
      description: description.trim(),
      category: category?.trim() || 'Full-Stack',
      tech_stack: formattedTechStack,
      demo_url: demo_url?.trim() || '',
      github_url: github_url?.trim() || '',
      image_url: image_url?.trim() || '',
      featured: Boolean(featured),
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged into the admin dashboard to delete projects.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id')?.trim();

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id?.trim();
      } catch {
        // body wasn't JSON
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required to delete' }, { status: 400 });
    }

    const result = await deleteProject(id);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Project not found or could not be deleted' },
        { status: result.error?.includes('not found') ? 404 : 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/projects error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete project' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged into the admin dashboard to edit projects.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, title, description, category, tech_stack, tagline, demo_url, github_url, image_url, featured } = body;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const formattedTechStack = Array.isArray(tech_stack)
      ? tech_stack
      : typeof tech_stack === 'string'
      ? tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const updated = await updateProject(id, {
      title: title.trim(),
      tagline: tagline?.trim() || '',
      description: description.trim(),
      category: category?.trim() || 'Full-Stack',
      tech_stack: formattedTechStack,
      demo_url: demo_url?.trim() || '',
      github_url: github_url?.trim() || '',
      image_url: image_url?.trim() || '',
      featured: Boolean(featured),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Project not found or could not be updated' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update project' }, { status: 500 });
  }
}
