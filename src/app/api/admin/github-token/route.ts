import { NextResponse } from 'next/server';
import { isRequestAuthorized } from '@/lib/adminAuth';
import {
  resolveGitHubToken,
  testGitHubConnection,
  GITHUB_TOKEN_COOKIE_NAME,
  getRepoConfig,
} from '@/lib/githubSync';

export async function GET(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { owner, repo, branch } = getRepoConfig();
    const token = await resolveGitHubToken(req);

    if (!token) {
      return NextResponse.json({
        configured: false,
        source: null,
        repo: `${owner}/${repo}`,
        branch,
      });
    }

    // Determine source
    const envToken =
      process.env.GITHUB_TOKEN ||
      process.env.GH_TOKEN ||
      process.env.GITHUB_PAT;
    const source = envToken ? 'environment' : 'session_cookie';

    // Test token health
    const testResult = await testGitHubConnection(token);

    return NextResponse.json({
      configured: testResult.valid && testResult.canWrite,
      source,
      repo: `${owner}/${repo}`,
      branch,
      username: testResult.username,
      canWrite: testResult.canWrite,
      error: testResult.error,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const token = body?.token?.trim();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify token with GitHub before saving
    const testResult = await testGitHubConnection(token);
    if (!testResult.valid) {
      return NextResponse.json({ error: testResult.error || 'Invalid token' }, { status: 400 });
    }

    if (!testResult.canWrite) {
      return NextResponse.json(
        {
          error:
            testResult.error ||
            'Token valid but lacks write permissions to this repository. Make sure to grant "repo" or "Contents: Read & write" permission.',
        },
        { status: 403 }
      );
    }

    const res = NextResponse.json({
      success: true,
      message: `Connected to GitHub as @${testResult.username}! Edits will now commit directly to ${testResult.repoName}.`,
      username: testResult.username,
      repo: testResult.repoName,
    });

    // Store in HTTP-only secure cookie for the admin session
    res.cookies.set(GITHUB_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save token' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authorized = await isRequestAuthorized(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, message: 'GitHub token cleared from session cookie' });
    res.cookies.delete(GITHUB_TOKEN_COOKIE_NAME);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to clear token' }, { status: 500 });
  }
}
