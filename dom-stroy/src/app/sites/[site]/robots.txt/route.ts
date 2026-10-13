import { originOf } from '@/lib/site';

export async function GET(_: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${originOf(site)}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
