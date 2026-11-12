export const SITE = {
  name: 'Anirudh Kanakatte',
  title: 'Anirudh Kanakatte · Full Stack AI Engineer',
  description:
    "Hi, I'm Anirudh, a Full Stack AI Engineer. This is my corner of the internet: what I'm building, reading and writing about.",
  url: 'https://www.anirudh.dev',
  twitter: '@anikanakatte',
  since: 2018,
  // Shown on the hero catalog card. Static on purpose; edit to change.
  stack: ['TypeScript', 'React', 'Node.js', 'Python'],
  // Served by netlify/functions/resume.mjs (proxied from a Google Doc). Opens in the browser's PDF viewer.
  resumePath: '/resume.pdf',
  // Flip to true once the blog (apps/blog) is live at /blog.
  blogEnabled: false,
};

export const DRAWERS = [
  { id: 'projects', dewey: '005', name: 'Projects' },
  { id: 'work', dewey: '331.7', name: 'Work' },
  { id: 'writing', dewey: '808', name: 'Writing' },
  { id: 'shelf', dewey: '028', name: 'Shelf' },
  { id: 'contact', dewey: '384', name: 'Contact' },
] as const;

export const SOCIALS = [
  { name: 'GitHub', href: 'https://github.com/anikanakatte' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/anikanakatte' },
  { name: 'X', href: 'https://x.com/anikanakatte' },
] as const;
