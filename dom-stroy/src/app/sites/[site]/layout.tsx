import { notFound } from 'next/navigation';
import { getCity, telHref } from '@/lib/site';

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ site: string }> }) {
  const { site } = await params;
  const city = await getCity(site);
  if (!city) notFound(); // неизвестный субдомен не должен попадать в индекс

  return (
    <>
      <header className="top">
        <a href="/" className="brand">Строй дом <span>{city.name}</span></a>
        <nav>
          <a href="/proekty">Проекты</a>
          <a href="/portfolio">Портфолио</a>
          <a href="/uslugi/stroitelstvo-domov">Дом под ключ</a>
          <a href="/uslugi/fundament">Фундамент</a>
          <a href="/uslugi/krovlya">Кровля</a>
        </nav>
        <a className="tel" href={telHref(city.phone)}>{city.phone}</a>
      </header>
      {children}
      <footer className="foot">
        <p>Строй дом. Строим {city.nameLocative} и по области. Фиксированная смета, поэтапная оплата, гарантия 5 лет.</p>
      </footer>
    </>
  );
}
