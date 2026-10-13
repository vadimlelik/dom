import { db } from '@/lib/db';
import { getCity, originOf } from '@/lib/site';

export const revalidate = 3600;

export async function GET(_: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const city = await getCity(site);
  if (!city) return new Response('Not found', { status: 404 });

  const o = originOf(site);
  const urls: string[] = [`${o}/`];
  if (city.isMain) {
    urls.push(`${o}/proekty`);
    (await db.project.findMany({ select: { slug: true } })).forEach((p) => urls.push(`${o}/proekty/${p.slug}`));
  }

  // В sitemap только страницы, которые индексируются (см. generateMetadata)
  const services = await db.service.findMany({
    where: city.isMain ? {} : { cities: { some: { cityId: city.id } } },
    select: { slug: true },
  });
  services.forEach((s) => urls.push(`${o}/uslugi/${s.slug}`));
  (await db.portfolioItem.findMany({ where: { cityId: city.id }, select: { slug: true } }))
    .forEach((p) => urls.push(`${o}/portfolio/${p.slug}`));

  if ((await db.portfolioItem.count({ where: { cityId: city.id } })) > 0) urls.push(`${o}/portfolio`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
    .map((u) => `<url><loc>${u}</loc></url>`).join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
