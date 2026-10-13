import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LeadForm from '@/components/LeadForm';
import { db } from '@/lib/db';
import { getCity, money, originOf, ROOT } from '@/lib/site';

export const revalidate = 3600;
type P = { params: Promise<{ site: string; slug: string }> };

async function load(site: string, slug: string) {
  const city = await getCity(site);
  const service = await db.service.findUnique({ where: { slug } });
  if (!city || !service) return null;
  const local = await db.cityService.findUnique({ where: { cityId_serviceId: { cityId: city.id, serviceId: service.id } } });
  return { city, service, local };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { site, slug } = await params;
  const d = await load(site, slug);
  if (!d) return {};
  const { city, service, local } = d;
  // Уникальная локальная версия -> индексируем. Иначе дубль общего текста: noindex и канон на основной домен.
  const unique = city.isMain || !!local;
  const price = money(local?.priceFrom ?? service.priceFrom ?? 0, local?.priceFrom ? 1 : city.priceCoef.toString());
  return {
    title: `${service.title} ${city.nameLocative} — цена от ${price} руб/${service.unit ?? 'объект'}`,
    description: `${service.title} ${city.nameLocative} под ключ: ${service.summary.toLowerCase()}. Фиксированная смета, гарантия.`,
    robots: unique ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: unique ? `${originOf(site)}/uslugi/${slug}` : `https://${ROOT}/uslugi/${slug}` },
  };
}

export default async function ServicePage({ params }: P) {
  const { site, slug } = await params;
  const d = await load(site, slug);
  if (!d) notFound();
  const { city, service, local } = d;

  return (
    <main>
      <section className="hero">
        <h1>{local?.h1 ?? `${service.title} ${city.nameLocative}`}</h1>
        <p className="lead-text">{local?.body ?? service.body}</p>
        <LeadForm city={site} />
      </section>
    </main>
  );
}
