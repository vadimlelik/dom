import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LeadForm from '@/components/LeadForm';
import Photo from '@/components/Photo';
import { db } from '@/lib/db';
import { MAT } from '@/lib/materials';
import { getCity, originOf } from '@/lib/site';

export const revalidate = 600;
type P = { params: Promise<{ site: string; slug: string }> };

async function load(site: string, slug: string) {
  const city = await getCity(site);
  const item = await db.portfolioItem.findUnique({ where: { slug } });
  if (!city || !item || item.cityId !== city.id) return null; // объект живёт только на своём хосте
  return { city, item };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { site, slug } = await params;
  const d = await load(site, slug);
  if (!d) return {};
  return {
    title: `${d.item.title}, ${d.item.place} — построено нами`,
    description: `${d.item.title}: ${MAT[d.item.material].label.toLowerCase()}, фундамент — ${d.item.foundation ?? 'по проекту'}. Объект рядом с ${d.city.name}.`,
    alternates: { canonical: `${originOf(site)}/portfolio/${slug}` },
  };
}

export default async function Item({ params }: P) {
  const { site, slug } = await params;
  const d = await load(site, slug);
  if (!d) notFound();
  const { city, item } = d;
  return (
    <main>
      <p className="crumbs"><a href="/">Главная</a> / <a href="/portfolio">Портфолио</a> / {item.title}</p>
      <section className="block split">
        <Photo images={item.images} material={item.material} floors={2} w={item.id} />
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem,4vw,3rem)', letterSpacing: '-.02em' }}>{item.title}</h1>
          <dl className="spec">
            <div><dt>Где</dt><dd>{item.place}</dd></div>
            <div><dt>Стены</dt><dd>{MAT[item.material].label}</dd></div>
            <div><dt>Фундамент</dt><dd>{item.foundation ?? '—'}</dd></div>
          </dl>
          <p>Хотите так же {city.nameLocative}? Рассчитаем похожий дом на вашем участке.</p>
          <LeadForm city={site} />
        </div>
      </section>
    </main>
  );
}
