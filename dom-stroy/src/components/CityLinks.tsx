import { db } from '@/lib/db';
import { originOf } from '@/lib/site';

export default async function CityLinks({ current }: { current: string }) {
  const cities = await db.city.findMany({ where: { published: true, subdomain: { not: current } }, orderBy: [{ isMain: 'desc' }, { name: 'asc' }] });
  return (
    <section className="block">
      <h2>Строим по всей Беларуси</h2>
      <ul className="cities">
        {cities.map((c) => <li key={c.id}><a href={originOf(c.subdomain)}>{c.name}</a></li>)}
      </ul>
    </section>
  );
}
