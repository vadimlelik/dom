import { cache } from 'react';
import { db } from './db';

export const ROOT = process.env.ROOT_DOMAIN ?? 'dom-stroy.by';
const SCHEME = process.env.SCHEME ?? 'https';

export const getCity = cache(async (sub: string) =>
  db.city.findFirst({ where: { subdomain: sub, published: true }, include: { region: true } }),
);

const PORT = process.env.PUBLIC_PORT ? `:${process.env.PUBLIC_PORT}` : '';
export const originOf = (sub: string) =>
  `${SCHEME}://${sub === 'main' ? ROOT : `${sub}.${ROOT}`}${PORT}`;

export const money = (n: unknown, coef: number | string = 1) =>
  new Intl.NumberFormat('ru-BY').format(Math.round(Number(n) * Number(coef)));

export const telHref = (p: string) => `tel:${p.replace(/[^+\d]/g, '')}`;

export const AREAS: Record<string, { label: string; gte?: number; lt?: number }> = {
  s: { label: 'до 100 м²', lt: 100 },
  m: { label: '100–150 м²', gte: 100, lt: 150 },
  l: { label: '150–200 м²', gte: 150, lt: 200 },
  xl: { label: 'от 200 м²', gte: 200 },
};
