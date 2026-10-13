import { PrismaClient, Material } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const PHONE = '+375 44 000-00-00'; // демо-номер, заменить на реальный

async function main() {
  const regions: Record<string, number> = {};
  for (const [slug, name] of [['minskaya', 'Минская область'], ['brestskaya', 'Брестская область'], ['grodnenskaya', 'Гродненская область'],
    ['gomelskaya', 'Гомельская область'], ['vitebskaya', 'Витебская область'], ['mogilevskaya', 'Могилёвская область']]) {
    regions[slug] = (await db.region.upsert({ where: { slug }, update: {}, create: { slug, name } })).id;
  }

  // sub, name, locative, region, lat, lng, coef, intro
  const cities: [string, string, string, string, number, number, number, string | null][] = [
    ['main', 'Минск', 'в Минске', 'minskaya', 53.9, 27.56, 1, 'Строим в Минске и Минской области: фиксированная смета в рублях, поэтапная оплата, гарантия 5 лет.'],
    ['soligorsk', 'Солигорск', 'в Солигорске', 'minskaya', 52.79, 27.54, 0.97, 'Работаем в Солигорске и Солигорском районе. Учитываем местные грунты с высоким уровнем грунтовых вод при выборе фундамента.'],
    ['brest', 'Брест', 'в Бресте', 'brestskaya', 52.09, 23.69, 0.96, 'Строим в Бресте и области. Мягкий климат позволяет вести работы почти круглый год.'],
    ['grodno', 'Гродно', 'в Гродно', 'grodnenskaya', 53.67, 23.83, 0.96, null],
    ['gomel', 'Гомель', 'в Гомеле', 'gomelskaya', 52.44, 30.98, 0.95, null],
    ['vitebsk', 'Витебск', 'в Витебске', 'vitebskaya', 55.19, 30.2, 0.94, null],
    ['mogilev', 'Могилёв', 'в Могилёве', 'mogilevskaya', 53.9, 30.33, 0.94, null],
    ['orsha', 'Орша', 'в Орше', 'vitebskaya', 54.51, 30.42, 0.93, 'Строим в Орше и Оршанском районе. Глубина промерзания и тип грунта определяют фундамент, поэтому перед проектом делаем геологию участка.'],
  ];
  const cityId: Record<string, number> = {};
  for (const [subdomain, name, nameLocative, reg, lat, lng, coef, intro] of cities) {
    const data = { subdomain, isMain: subdomain === 'main', name, nameLocative, regionId: regions[reg], lat, lng, priceCoef: coef, phone: PHONE, intro, published: true };
    cityId[subdomain] = (await db.city.upsert({ where: { subdomain }, update: data, create: data })).id;
  }

  const services = [
    { slug: 'stroitelstvo-domov', title: 'Дом под ключ', summary: 'От проекта до заселения', body: 'Берём на себя проект, фундамент, стены, кровлю, инженерию и отделку. Цена фиксируется в договоре.', priceFrom: 900, unit: 'м²' },
    { slug: 'fundament', title: 'Фундамент', summary: 'Ленточный, плитный, винтовой', body: 'Подбираем тип фундамента по грунту и нагрузке дома.', priceFrom: 120, unit: 'м²' },
    { slug: 'krovlya', title: 'Кровля', summary: 'Металлочерепица, мягкая кровля', body: 'Стропильная система, утепление, покрытие, водостоки.', priceFrom: 45, unit: 'м²' },
  ];
  const svc: Record<string, number> = {};
  for (const s of services) svc[s.slug] = (await db.service.upsert({ where: { slug: s.slug }, update: s, create: s })).id;

  // Локальные версии услуг: есть запись = страница индексируется на субдомене
  const local: [string, string, string, string][] = [
    ['orsha', 'fundament', 'Фундамент в Орше', 'В Оршанском районе встречаются пучинистые суглинки и высокий уровень грунтовых вод. Чаще всего ставим монолитную плиту или ленту ниже глубины промерзания, после геологии участка.'],
    ['orsha', 'stroitelstvo-domov', 'Строительство домов под ключ в Орше', 'Строим в Орше, Барани и окрестных посёлках. Выезжаем на участок бесплатно, считаем смету за 1–2 дня.'],
    ['soligorsk', 'stroitelstvo-domov', 'Строительство домов под ключ в Солигорске', 'Строим в Солигорске и Уречье. Для участков с близкими грунтовыми водами закладываем дренаж и гидроизоляцию.'],
    ['brest', 'stroitelstvo-domov', 'Строительство домов под ключ в Бресте', 'Строим в Бресте и Брестском районе. Мягкий климат позволяет начинать работы раньше.'],
  ];
  for (const [c, s, h1, body] of local) {
    const key = { cityId_serviceId: { cityId: cityId[c], serviceId: svc[s] } };
    await db.cityService.upsert({ where: key, update: { h1, body }, create: { cityId: cityId[c], serviceId: svc[s], h1, body } });
  }

  const projects: [string, string, Material, number, number][] = [
    ['aurora', 'Аврора', 'GAZOBLOK', 1, 64], ['bereza', 'Берёза', 'BRUS', 2, 82], ['vilia', 'Вилия', 'KIRPICH', 1, 96],
    ['gorizont', 'Горизонт', 'KARKAS', 1, 72], ['dubrava', 'Дубрава', 'BREVNO', 2, 118], ['zaretsye', 'Заречье', 'KERAMZIT', 2, 132],
    ['lipa', 'Липа', 'SIP', 1, 90], ['neman', 'Неман', 'GAZOBLOK', 2, 156], ['osoka', 'Осока', 'PENOBLOK', 1, 104],
    ['pripyat', 'Припять', 'KIRPICH', 2, 186], ['sozh', 'Сож', 'BRUS', 2, 142], ['usad', 'Усадьба', 'KERAMZIT', 2, 224],
  ];
  const rate: Record<Material, number> = { GAZOBLOK: 950, PENOBLOK: 900, KERAMZIT: 920, KIRPICH: 1150, BRUS: 1050, BREVNO: 1100, KARKAS: 700, SIP: 750 };
  for (const [slug, title, material, floors, area] of projects) {
    const data = { slug, title, material, floors, area, priceFrom: area * rate[material] };
    await db.project.upsert({ where: { slug }, update: data, create: data });
  }

  const portfolio: [string, string, string, string, Material, string][] = [
    ['main', 'shchomyslitsa-gazoblok', 'Дом из газоблока, 1 этаж', 'Щомыслица', 'GAZOBLOK', 'Монолитная плита'],
    ['main', 'korolishchevichi-keramzit', 'Двухэтажный дом из керамзитоблока', 'Королищевичи', 'KERAMZIT', 'Монолитная плита'],
    ['main', 'borovlyany-kirpich', 'Кирпичный коттедж', 'Боровляны', 'KIRPICH', 'Ленточный'],
    ['orsha', 'orsha-baran-karkas', 'Каркасный дом на винтовых сваях', 'Барань', 'KARKAS', 'Винтовые сваи'],
    ['orsha', 'orsha-gazoblok', 'Дом из газоблока с штукатуркой', 'Орша', 'GAZOBLOK', 'Монолитная плита'],
    ['soligorsk', 'urechye-brus', 'Дом из бруса', 'Уречье', 'BRUS', 'Столбчатый'],
    ['brest', 'trishin-kirpich', 'Кирпичный дом', 'Тришин', 'KIRPICH', 'Ленточный'],
  ];
  for (const [c, slug, title, place, material, foundation] of portfolio) {
    const data = { slug, title, place, material, foundation, cityId: cityId[c] };
    await db.portfolioItem.upsert({ where: { slug }, update: data, create: data });
  }
}
main().finally(() => db.$disconnect());
