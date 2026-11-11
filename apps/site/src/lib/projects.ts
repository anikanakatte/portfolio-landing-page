// Projects come from GitHub: every public, non-fork repo of GITHUB_USER tagged with the
// topic `portfolio`. Fetched once per build (memoised). See CLAUDE.md "Decisions".
import { GITHUB_USER, gh, safely } from './github';

export const PORTFOLIO_TOPIC = 'portfolio';

export interface Project {
  name: string; // repo name, used for keys
  title: string;
  callNo: string; // e.g. "005\nMIC"
  years: string; // "2020" or "2018–23"
  description: string | null;
  subjects: string[];
  sourceUrl: string;
  liveUrl: string | null;
}

interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  topics?: string[];
  language: string | null;
  fork: boolean;
  private: boolean;
  created_at: string;
  pushed_at: string;
}

// Hosts that mean "this project is deployed here" when linked from a README.
const HOSTING = /https?:\/\/[^\s)"'<>]+\.(?:vercel\.app|netlify\.app|github\.io|pages\.dev|herokuapp\.com|onrender\.com|fly\.dev|railway\.app|surge\.sh|web\.app|firebaseapp\.com|streamlit\.app|hf\.space)[^\s)"'<>]*/i;

// Nicer labels for common topic slugs; anything else is title-cased.
const TOPIC_LABELS: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', nodejs: 'Node.js', node: 'Node.js',
  reactjs: 'React', react: 'React', nextjs: 'Next.js', python: 'Python', llm: 'LLMs',
  ai: 'AI', openai: 'OpenAI', postgresql: 'PostgreSQL', mongodb: 'MongoDB', css: 'CSS',
  html: 'HTML', expressjs: 'Express', express: 'Express', api: 'API', rag: 'RAG',
  'chrome-extension': 'Chrome extension', fastapi: 'FastAPI', astro: 'Astro', java: 'Java',
};

const tidy = (s: string) =>
  s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());

const label = (topic: string) => TOPIC_LABELS[topic.toLowerCase()] ?? tidy(topic);

function stripMarkdown(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/<[^>]+>/g, '') // inline html
    .replace(/(\*\*|__|\*|_|`)/g, '') // emphasis, code
    .replace(/\s+/g, ' ')
    .trim();
}

/** README -> { title, first prose paragraph }. */
export function parseReadme(md: string): { title: string | null; summary: string | null } {
  const lines = md.replace(/<!--[\s\S]*?-->/g, '').replace(/\r/g, '').split('\n');
  let title: string | null = null;
  const paras: string[] = [];
  let buf: string[] = [];
  let inCode = false;
  const flush = () => {
    if (buf.length) paras.push(buf.join(' '));
    buf = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('```')) { inCode = !inCode; flush(); continue; }
    if (inCode) continue;
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flush();
      if (!title && h[1] === '#') { title = stripMarkdown(h[2]); continue; }
      if (paras.length) break; // stop at the first section after we have prose
      continue;
    }
    // Setext H1 ("Title\n=====")
    if (!title && /^=+$/.test(lines[i + 1]?.trim() ?? '') && line) { title = stripMarkdown(line); i++; continue; }
    if (!line || /^[-*+]\s|^\d+\.\s|^>|^\||^(-{3,}|\*{3,})$/.test(line)) { flush(); if (paras.length) break; continue; }
    buf.push(line);
  }
  flush();
  const summary = paras.map(stripMarkdown).find((p) => p.length > 0) ?? null;
  return { title, summary };
}

/** Cut to at most ~max chars, preferring a sentence boundary. */
function clip(s: string, max = 220): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const end = cut.lastIndexOf('. ');
  return end > 80 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
}

const sentence = (s: string) => {
  const t = s.trim();
  return /[.!?…]$/.test(t) ? t.charAt(0).toUpperCase() + t.slice(1) : `${t.charAt(0).toUpperCase()}${t.slice(1)}.`;
};

/** True if the URL answers with a non-error status within the timeout. */
async function isAlive(url: string): Promise<boolean> {
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(6000) });
      if (res.ok) return true;
      if (method === 'HEAD' && (res.status === 405 || res.status === 403)) continue; // host dislikes HEAD
      return false;
    } catch {
      if (method === 'GET') return false;
    }
  }
  return false;
}

async function readme(repo: string): Promise<string | null> {
  try {
    return await gh<string>(`/repos/${GITHUB_USER}/${repo}/readme`, 'raw');
  } catch (err) {
    if (/-> 404\b/.test((err as Error).message)) return null; // repo has no README
    throw err; // rate limit / network: fail loudly rather than publish empty cards
  }
}

async function toProject(r: Repo): Promise<Project> {
  const md = await readme(r.name);
  const { title: readmeTitle, summary } = md ? parseReadme(md) : { title: null, summary: null };

  const title = (readmeTitle && /\s/.test(readmeTitle) ? readmeTitle : tidy(readmeTitle ?? r.name)).replace(/\s+-\s+/g, ' — ');
  const rawDesc = summary ?? r.description;
  const description = rawDesc ? sentence(clip(rawDesc)) : null;

  const candidates = [r.homepage?.trim(), md?.match(HOSTING)?.[0]].filter((u): u is string => !!u);
  let liveUrl: string | null = null;
  for (const url of candidates) {
    const normalised = /^https?:\/\//.test(url) ? url : `https://${url}`;
    if (await isAlive(normalised)) { liveUrl = normalised; break; }
    console.warn(`[projects] ${r.name}: dropping dead link ${normalised}`);
  }

  const subjects = [
    ...(r.language ? [r.language] : []),
    ...(r.topics ?? []).filter((t) => t !== PORTFOLIO_TOPIC).map(label),
  ].filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);

  const start = new Date(r.created_at).getFullYear();
  const end = new Date(r.pushed_at).getFullYear();
  const years = end > start ? `${start}–${String(end).slice(-2)}` : String(start);
  const letters = title.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'XXX';

  return {
    name: r.name,
    title,
    callNo: `005\n${letters}`,
    years,
    description,
    subjects,
    sourceUrl: r.html_url,
    liveUrl,
  };
}

let projectsPromise: Promise<Project[] | null> | undefined;

export function getProjects(): Promise<Project[] | null> {
  projectsPromise ??= safely('projects', async () => {
    const repos = await gh<Repo[]>(`/users/${GITHUB_USER}/repos?per_page=100&type=owner&sort=pushed`);
    const tagged = repos.filter((r) => !r.fork && !r.private && r.topics?.includes(PORTFOLIO_TOPIC));
    // Most recently pushed first (the API sort already does this; keep it explicit).
    tagged.sort((a, b) => b.pushed_at.localeCompare(a.pushed_at));
    return Promise.all(tagged.map(toProject));
  });
  return projectsPromise;
}
