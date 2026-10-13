import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LeadForm from '@/components/LeadForm';
import Calculator from '@/components/Calculator';
import CityLinks from '@/components/CityLinks';
import Photo from '@/components/Photo';
import { MAT } from '@/lib/materials';
import { db } from '@/lib/db';
import { orgLd } from '@/lib/jsonld';
import { getCity, money, originOf } from '@/lib/site';

export const revalidate = 3600;
type P = { params: Promise<{ site: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { site } = await params;
  const c = await getCity(site);
  if (!c) return {};
  return {
    title: `Строительство домов под ключ ${c.nameLocative} — цены, проекты, гарантия 5 лет`,
    description: `Строим дома и коттеджи ${c.nameLocative} и в области: фиксированная смета, поэтапная оплата. Готовые проекты, расчёт стоимости за 1 день.`,
    alternates: { canonical: originOf(site) + '/' },
    openGraph: { locale: 'ru_BY', siteName: 'Строй дом', url: originOf(site) },
  };
}

export default async function Home({ params }: P) {
  const { site } = await params;
  const city = await getCity(site);
  if (!city) notFound();

  const [services, portfolio, projects] = await Promise.all([
    db.service.findMany({ orderBy: { id: 'asc' } }),
    db.portfolioItem.findMany({ where: { cityId: city.id }, take: 6, orderBy: { id: 'desc' } }),
    db.project.findMany({ take: 4, orderBy: { id: 'asc' } }),
  ]);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd(city)) }} />
      <section className="hero">
        <h1>Строим дома под ключ {city.nameLocative}</h1>
        <p className="lead-text">{city.intro ?? `Дом по фиксированной смете в рублях. Платите по этапам, за выполненную работу.`}</p>
        <LeadForm city={site} />
      </section>

      <section className="block">
        <h2>Готовые проекты</h2>
        <ul className="tiles">
          {projects.map((p) => (
            <li key={p.id}><a href={`/proekty/${p.slug}`}>
              <Photo images={p.images} material={p.material} floors={p.floors} w={p.id} />
              <h3>{p.title}</h3><p>{MAT[p.material].label}, {p.floors} эт., {Number(p.area)} м²</p>
              <b>от {money(p.priceFrom, city.priceCoef.toString())} руб</b>
            </a></li>
          ))}
        </ul>
        <p style={{ marginTop: '1rem' }}><a className="btn" href="/proekty">Все проекты</a></p>
      </section>

      <Calculator city={site} coef={Number(city.priceCoef)} name={city.nameLocative} />

      <section className="block">
        <h2>Что строим и делаем {city.nameLocative}</h2>
        <ul className="rows">
          {services.map((s) => (
            <li key={s.id}>
              <a href={`/uslugi/${s.slug}`}>
                <strong>{s.title}</strong>
                <span>{s.summary}</span>
                {s.priceFrom && <em>от {money(s.priceFrom, city.priceCoef.toString())} руб/{s.unit}</em>}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {portfolio.length > 0 && (
        <section className="block">
          <h2>Наши объекты: {city.name} и окрестности</h2>
          <ul className="rows">
            {portfolio.map((p) => (
              <li key={p.id}><a href={`/portfolio/${p.slug}`}><strong>{p.title}</strong><span>{p.place}</span></a></li>
            ))}
          </ul>
        </section>
      )}
      <CityLinks current={site} />
    </main>
  );
}
