// Serves the résumé at /resume.pdf, proxied from a public Google Doc's PDF export.
// Google's export URL forces a download (Content-Disposition: attachment); this route re-serves
// it inline so it opens in the browser's PDF viewer, and lets Netlify's CDN cache it for an hour.
//
// To point at a different doc, change RESUME_DOC_ID below or set the RESUME_DOC_ID env var in
// Netlify. It isn't a secret: the doc must be shared as "Anyone with the link: Viewer".

const DEFAULT_RESUME_DOC_ID = '13PQCCmurldBRzKn2BeJptTCwGjRPgVtCQH2UBqCS9Hc';
const RESUME_DOC_ID = process.env.RESUME_DOC_ID || DEFAULT_RESUME_DOC_ID;
const EXPORT_URL = `https://docs.google.com/document/d/${RESUME_DOC_ID}/export?format=pdf`;
const FILENAME = 'AnirudhKanakatte_Resume.pdf';

const unavailable = (detail) => {
  console.error(`[resume] ${detail}`);
  return new Response('Résumé is temporarily unavailable. Please try again later.\n', {
    status: 502,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};

export default async () => {
  let upstream;
  try {
    // Google answers with a redirect to googleusercontent.com; follow it.
    upstream = await fetch(EXPORT_URL, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
  } catch (err) {
    return unavailable(`fetch failed: ${err.message}`);
  }

  const type = upstream.headers.get('content-type') ?? '';
  // A non-PDF reply usually means the doc's sharing changed and Google sent a sign-in page.
  if (!upstream.ok || !type.toLowerCase().startsWith('application/pdf')) {
    return unavailable(`unexpected upstream response: ${upstream.status} ${type}`);
  }

  const pdf = await upstream.arrayBuffer();
  return new Response(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${FILENAME}"`,
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};

export const config = { path: '/resume.pdf' };
