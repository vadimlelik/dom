import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LeadForm from '@/components/LeadForm';
import Photo from '@/components/Photo';
import { db } from '@/lib/db';
import { MAT } from '@/lib/materials';
import { getCity, money, ROOT } from '@/lib/site';

export const revalidate = 600;
type P = { params: Promise<{ site: string; slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { site, slug } = await params;
  const [c, p] = await Promise.all([getCity(site), db.project.findUnique({ where: { slug } })]);
  if (!c || !p) return {};
  return {
    title: `Проект дома «${p.title}» ${Number(p.area)} м² из ${MAT[p.material].gen} — цена под ключ`,
    description: `Проект «${p.title}»: ${p.floors} эт., ${Number(p.area)} м². Строительство ${c.nameLocative} по фиксированной смете.`,
    robots: { index: c.isMain, follow: true },
    alternates: { canonical: `https://${ROOT}/proekty/${slug}` },
  };
}

export default async function ProjectPage({ params }: P) {
  const { site, slug } = await params;
  const [city, p] = await Promise.all([getCity(site), db.project.findUnique({ where: { slug } })]);
  if (!city || !p) notFound();
  const price = money(p.priceFrom, city.priceCoef.toString());

  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: `Проект дома «${p.title}»`,
    category: 'Проекты домов', brand: { '@type': 'Brand', name: 'Строй дом' },
    offers: { '@type': 'Offer', priceCurrency: 'BYN', price: Math.round(Number(p.priceFrom) * Number(city.priceCoef)), availability: 'https://schema.org/InStock' },
  };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p className="crumbs"><a href="/">Главная</a> / <a href="/proekty">Проекты</a> / {p.title}</p>
      <section className="block split">
        <Photo images={p.images} material={p.material} floors={p.floors} w={p.id} />
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem,4vw,3rem)', letterSpacing: '-.02em' }}>Проект «{p.title}»</h1>
          <dl className="spec">
            <div><dt>Площадь</dt><dd>{Number(p.area)} м²</dd></div>
            <div><dt>Этажей</dt><dd>{p.floors}</dd></div>
            <div><dt>Стены</dt><dd>{MAT[p.material].label}</dd></div>
            <div><dt>Цена {city.nameLocative}</dt><dd>от {price} руб</dd></div>
          </dl>
          <p>Строим {city.nameLocative} и в области. Цена фиксируется в договоре, оплата по этапам.</p>
          <LeadForm city={site} />
        </div>
      </section>
    </main>
  );
}
