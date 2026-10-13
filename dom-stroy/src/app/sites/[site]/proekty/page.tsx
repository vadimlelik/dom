import type { Metadata } from 'next';
import type { Material, Prisma } from '@prisma/client';
import { notFound } from 'next/navigation';
import Photo from '@/components/Photo';
import { db } from '@/lib/db';
import { MAT, MATERIALS } from '@/lib/materials';
import { AREAS, getCity, money, originOf, ROOT } from '@/lib/site';

export const revalidate = 600;
type P = { params: Promise<{ site: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const { site } = await params;
  const sp = await searchParams;
  const c = await getCity(site);
  if (!c) return {};
  const filtered = Object.values(sp).some(Boolean);
  const indexable = c.isMain && !filtered; // каталог — единый источник на основном домене
  return {
    title: `Проекты домов и коттеджей ${c.isMain ? 'в Беларуси' : c.nameLocative} — цены под ключ`,
    description: 'Готовые проекты домов из газоблока, кирпича, бруса, каркаса: планировки, площади, цена под ключ.',
    robots: { index: indexable, follow: true },
    alternates: { canonical: `https://${ROOT}/proekty` },
  };
}

export default async function Catalog({ params, searchParams }: P) {
  const { site } = await params;
  const sp = await searchParams;
  const city = await getCity(site);
  if (!city) notFound();

  const where: Prisma.ProjectWhereInput = {};
  if (sp.material && (MATERIALS as string[]).includes(sp.material)) where.material = sp.material as Material;
  if (sp.floors && [1, 2, 3].includes(+sp.floors)) where.floors = +sp.floors;
  const a = sp.area ? AREAS[sp.area] : undefined;
  if (a) where.area = { gte: a.gte, lt: a.lt };

  const projects = await db.project.findMany({ where, orderBy: { area: 'asc' } });

  return (
    <main>
      <p className="crumbs"><a href="/">Главная</a> / Проекты</p>
      <section className="block" style={{ paddingBottom: 0 }}><h1 style={{ margin: 0, fontSize: 'clamp(1.8rem,4vw,3rem)', letterSpacing: '-.02em' }}>Проекты домов {city.nameLocative}</h1></section>
      <form className="filters" method="get">
        <label>Материал<select name="material" defaultValue={sp.material ?? ''}><option value="">Любой</option>{MATERIALS.map((m) => <option key={m} value={m}>{MAT[m].label}</option>)}</select></label>
        <label>Этажность<select name="floors" defaultValue={sp.floors ?? ''}><option value="">Любая</option><option value="1">1 этаж</option><option value="2">2 этажа</option></select></label>
        <label>Площадь<select name="area" defaultValue={sp.area ?? ''}><option value="">Любая</option>{Object.entries(AREAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
        <button>Показать</button>
        <a href="/proekty" style={{ color: 'var(--mute)' }}>Сбросить</a>
      </form>
      <section className="block">
        {projects.length === 0 ? <p>По этим условиям проектов нет. Сбросьте фильтр или <a href="/#raschet">рассчитайте индивидуальный дом</a>.</p> : (
          <ul className="tiles">
            {projects.map((p) => (
              <li key={p.id}><a href={`/proekty/${p.slug}`}>
                <Photo images={p.images} material={p.material} floors={p.floors} w={p.id} />
                <h3>{p.title}</h3>
                <p>{MAT[p.material].label}, {p.floors} эт., {Number(p.area)} м²</p>
                <b>от {money(p.priceFrom, city.priceCoef.toString())} руб</b>
              </a></li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
