# Строй дом: Next.js 15 + Prisma + Postgres + MinIO, города на субдоменах

Один код обслуживает `dom-stroy.by` (Минск) и `<город>.dom-stroy.by`. `src/middleware.ts` по Host
переписывает запрос в `/sites/<город>`; города лежат в таблице `City`. Неизвестный или
неопубликованный субдомен отдаёт 404.

## Показать заказчику (локально)
    docker compose -f docker-compose.demo.yml up --build
    # Минск http://localhost:3000   Орша http://orsha.localhost:3000   Брест http://brest.localhost:3000
Поддомены `*.localhost` открываются в Chrome/Firefox/Edge без правки hosts.
Без Docker: поднять Postgres, в `.env` указать `DATABASE_URL`, затем
`npm i && npx prisma db push && npm run db:seed && npm run dev`.

## Что есть
- Главная города: уникальный intro, проекты, калькулятор стоимости (цены с региональным коэффициентом), услуги, портфолио, ссылки на другие города.
- Каталог проектов с фильтрами (материал, этажность, площадь) и карточка проекта с JSON-LD `Product`.
- Услуги, где локальная версия есть только у части городов, и портфолио по городам.
- Заявки: форма пишет в таблицу `Lead` и в Telegram (если заданы `TELEGRAM_*`).
- SEO: Metadata, canonical, JSON-LD `GeneralContractor` (единый `@id`), sitemap и robots для каждого хоста.

## Логика против дублей
- Услуга на субдомене индексируется только при наличии записи `CityService`; иначе `noindex` и canonical на основной домен.
- Каталог и карточки проектов: единый источник на `dom-stroy.by`, на субдоменах `noindex` + canonical на основной.
- Страницы фильтров (`?material=…`) всегда `noindex`.
- Портфолио принадлежит одному городу: на чужом хосте 404.
- В sitemap попадают только индексируемые страницы.

## VPS
1. DNS: `A @`, `A *` на IP сервера. Отдельно `img` для MinIO (его покрывает wildcard).
2. Wildcard-сертификат (DNS-01): `certbot certonly --manual --preferred-challenges dns -d dom-stroy.by -d '*.dom-stroy.by'`
   (для автообновления нужен плагин под вашего DNS-провайдера).
3. `cp .env.example .env`, задать пароли (DATABASE_URL с хостом `db` и тем же паролем, что POSTGRES_PASSWORD).
4. `docker compose up -d --build`. Сервис `migrate` сам применит схему и загрузит демо-данные (идемпотентно).
5. MinIO: создать бакет `media`, `mc anonymous set download local/media`. Ключ файла в `images[]` объекта
   подставится в `https://img.dom-stroy.by/<ключ>`; пока фото нет, показывается иллюстрация.
6. Search Console: свойство «Домен» (DNS TXT). Яндекс.Вебмастер: каждый субдомен отдельно + регион.

## Демо-данные и что заменить
Телефон (`prisma/seed.ts`, `PHONE`), цены и коэффициенты, названия проектов, тексты городов, объекты портфолио
и формулировки о гарантиях выдуманы для показа. Перед запуском заменить на реальные.

## Не сделано
Админка (пока править данные через `npx prisma studio`), загрузка фото в MinIO из интерфейса, блог,
страницы услуг для всех городов с уникальным текстом, ISR через `generateStaticParams` (сейчас SSR на каждый запрос).
