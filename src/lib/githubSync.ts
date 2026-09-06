import { cookies } from 'next/headers';

export const GITHUB_TOKEN_COOKIE_NAME = 'edward_admin_github_token';
export const DEFAULT_REPO_OWNER = 'emmanueledward303';
export const DEFAULT_REPO_NAME = 'portfolio';
export const DEFAULT_BRANCH = 'main';

export function getRepoConfig() {
  return {
    owner: process.env.GITHUB_REPO_OWNER || DEFAULT_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME || DEFAULT_REPO_NAME,
    branch: process.env.GITHUB_BRANCH || DEFAULT_BRANCH,
  };
}

/**
 * Resolves the GitHub Token from environment variables or the admin session cookie.
 */
export async function resolveGitHubToken(req?: Request): Promise<string | null> {
  // 1. Check environment variables first (configured in Vercel / .env.local)
  const envToken =
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.GITHUB_PAT;
  if (envToken && envToken.trim().length > 0) {
    return envToken.trim();
  }

  // 2. Check Cookie header from incoming request
  if (req) {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const cookiesList = cookieHeader.split(';');
      for (const item of cookiesList) {
        const [name, ...valParts] = item.trim().split('=');
        if (name === GITHUB_TOKEN_COOKIE_NAME) {
          const val = decodeURIComponent(valParts.join('=')).trim();
          if (val) return val;
        }
      }
    }
  }

  // 3. Check Next.js cookies() store
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(GITHUB_TOKEN_COOKIE_NAME);
    if (tokenCookie?.value?.trim()) {
      return tokenCookie.value.trim();
    }
  } catch {
    // Outside request context
  }

  return null;
}

export interface GitHubFileResult<T> {
  data: T;
  sha: string;
}

/**
 * Fetches a file from the GitHub repository and returns its parsed content and sha.
 */
export async function fetchFileFromGitHub<T = any>(
  filePath: string,
  token?: string | null
): Promise<GitHubFileResult<T> | null> {
  const { owner, repo, branch } = getRepoConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Admin-Sync',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      headers,
      cache: 'no-store', // Always get fresh data from GitHub
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (!json.content) return null;

    const rawStr = Buffer.from(json.content, 'base64').toString('utf-8');
    const parsed = JSON.parse(rawStr);
    return { data: parsed, sha: json.sha };
  } catch (err) {
    console.error(`fetchFileFromGitHub error for ${filePath}:`, err);
    return null;
  }
}

/**
 * Commits or updates a file in the GitHub repository.
 */
export async function commitFileToGitHub(
  filePath: string,
  content: string | Buffer,
  commitMessage: string,
  token: string
): Promise<{ success: boolean; sha?: string; error?: string }> {
  if (!token) {
    return { success: false, error: 'GitHub Token is required for auto-commit' };
  }

  const { owner, repo, branch } = getRepoConfig();

  // 1. Get existing file SHA if file exists
  let existingSha: string | undefined;
  const existingUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

  try {
    const existingRes = await fetch(existingUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Portfolio-Admin-Sync',
      },
      cache: 'no-store',
    });

    if (existingRes.ok) {
      const existingData = await existingRes.json();
      existingSha = existingData.sha;
    }
  } catch (err) {
    console.error(`Error checking existing SHA for ${filePath}:`, err);
  }

  // 2. Base64 encode the content
  const base64Content = Buffer.isBuffer(content)
    ? content.toString('base64')
    : Buffer.from(content, 'utf-8').toString('base64');

  // 3. Send PUT request to create or update file
  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const payload: Record<string, any> = {
    message: commitMessage,
    content: base64Content,
    branch,
  };

  if (existingSha) {
    payload.sha = existingSha;
  }

  try {
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-Admin-Sync',
      },
      body: JSON.stringify(payload),
    });

    const result = await putRes.json();

    if (!putRes.ok) {
      const msg = result.message || `GitHub API error (${putRes.status})`;
      console.error(`commitFileToGitHub failed:`, msg, result);
      return { success: false, error: msg };
    }

    return {
      success: true,
      sha: result.content?.sha || result.commit?.sha,
    };
  } catch (err: any) {
    console.error(`commitFileToGitHub network error:`, err);
    return { success: false, error: err.message || 'Network error while committing to GitHub' };
  }
}

/**
 * Tests if the given GitHub token can access and write to the repository.
 */
export async function testGitHubConnection(token: string): Promise<{
  valid: boolean;
  canWrite: boolean;
  username?: string;
  repoName?: string;
  error?: string;
}> {
  if (!token || !token.trim()) {
    return { valid: false, canWrite: false, error: 'Token is empty' };
  }

  const { owner, repo } = getRepoConfig();

  try {
    // 1. Check user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token.trim()}`,
        'User-Agent': 'Portfolio-Admin-Sync',
      },
      cache: 'no-store',
    });

    if (!userRes.ok) {
      return { valid: false, canWrite: false, error: 'Invalid or expired GitHub Token' };
    }

    const userData = await userRes.json();
    const username = userData.login;

    // 2. Check repository permissions
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token.trim()}`,
        'User-Agent': 'Portfolio-Admin-Sync',
      },
      cache: 'no-store',
    });

    if (!repoRes.ok) {
      return {
        valid: true,
        canWrite: false,
        username,
        error: `Token is valid, but cannot access repository ${owner}/${repo}. Check token permissions.`,
      };
    }

    const repoData = await repoRes.json();
    const permissions = repoData.permissions || {};
    const canWrite = Boolean(permissions.push || permissions.admin);

    return {
      valid: true,
      canWrite,
      username,
      repoName: `${owner}/${repo}`,
      error: canWrite
        ? undefined
        : `Token lacks write (push) permissions to repository ${owner}/${repo}. Please grant 'repo' scope or 'Contents: Read and write'.`,
    };
  } catch (err: any) {
    return { valid: false, canWrite: false, error: err.message || 'Connection failed' };
  }
}
