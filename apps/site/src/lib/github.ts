// Build-time GitHub data. Runs once per build (results are memoised), never in the browser.
// Set GITHUB_TOKEN (read-only, public repos) in Netlify to avoid the 60 req/hour anonymous limit.

export const GITHUB_USER = 'anikanakatte';


export async function gh<T>(path: string): Promise<T> {
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
