import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Photo from '@/components/Photo';
import { db } from '@/lib/db';
import { MAT } from '@/lib/materials';
import { getCity, originOf } from '@/lib/site';

export const revalidate = 600;
type P = { params: Promise<{ site: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { site } = await params;
  const c = await getCity(site);
  if (!c) return {};
  const n = await db.portfolioItem.count({ where: { cityId: c.id } });
  return {
    title: `Построенные дома ${c.nameLocative} — портфолио`,
    description: `Объекты, которые мы построили ${c.nameLocative} и рядом: материалы, фундамент, фото.`,
    robots: { index: n > 0, follow: true },
    alternates: { canonical: `${originOf(site)}/portfolio` },
  };
}

export default async function Portfolio({ params }: P) {
  const { site } = await params;
  const city = await getCity(site);
  if (!city) notFound();
  const items = await db.portfolioItem.findMany({ where: { cityId: city.id }, orderBy: { id: 'desc' } });
  return (
    <main>
      <p className="crumbs"><a href="/">Главная</a> / Портфолио</p>
      <section className="block">
        <h1 style={{ margin: '0 0 1.5rem', fontSize: 'clamp(1.8rem,4vw,3rem)', letterSpacing: '-.02em' }}>Наши объекты: {city.name}</h1>
        {items.length === 0 ? <p>Здесь скоро появятся объекты. А пока посмотрите <a href="/proekty">проекты</a>.</p> : (
          <ul className="tiles">
            {items.map((p) => (
              <li key={p.id}><a href={`/portfolio/${p.slug}`}>
                <Photo images={p.images} material={p.material} floors={2} w={p.id} />
                <h3>{p.title}</h3><p>{p.place}, {MAT[p.material].label}</p>
              </a></li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
