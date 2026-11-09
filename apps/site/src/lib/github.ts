// Build-time GitHub data. Runs once per build (results are memoised), never in the browser.
// Set GITHUB_TOKEN (read-only, public repos) in Netlify to avoid the 60 req/hour anonymous limit.

export const GITHUB_USER = 'anikanakatte';

export interface Profile {
  publicRepos: number;
  topLanguages: string[];
}

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'anirudh.dev-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${path} -> ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

/**
 * On failure: production builds throw (Netlify keeps the last good deploy live),
 * local dev logs a warning and returns null so the page still renders offline.
 */
export async function safely<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (import.meta.env.PROD) throw err;
    console.warn(`[github] ${label} unavailable in dev: ${(err as Error).message}`);
    return null;
  }
}

let profilePromise: Promise<Profile | null> | undefined;

export function getProfile(): Promise<Profile | null> {
  profilePromise ??= safely('profile', async () => {
    const user = await gh<{ public_repos: number }>(`/users/${GITHUB_USER}`);
    const repos = await gh<{ fork: boolean; language: string | null }[]>(
      `/users/${GITHUB_USER}/repos?per_page=100&type=owner`,
    );
    const counts = new Map<string, number>();
    for (const r of repos) {
      if (r.fork || !r.language) continue;
      counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    }
    const topLanguages = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);
    return { publicRepos: user.public_repos, topLanguages };
  });
  return profilePromise;
}
