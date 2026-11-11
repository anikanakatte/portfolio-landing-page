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
  // Résumé PDF on Google Drive ("AnirudhKanakatte_Resume.pdf", shared as Anyone with the link: Viewer).
  // To update it, use Drive's "Manage versions → Upload new version" on that file so this link stays the same.
  resumeUrl: 'https://drive.google.com/file/d/1PB7QOhaLWEehxEiZwoVMLVjp7E5Tyei9/view',
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
