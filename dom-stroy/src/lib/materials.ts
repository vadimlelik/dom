import type { Material } from '@prisma/client';

// rate — ориентир руб/м² под ключ для Минска (демо-значения), wall — цвет на иллюстрации
export const MAT: Record<Material, { label: string; gen: string; wall: string; rate: number }> = {
  GAZOBLOK: { gen: 'газоблока', label: 'Газоблок', wall: '#d9dde1', rate: 950 },
  PENOBLOK: { gen: 'пеноблока', label: 'Пеноблок', wall: '#cfd5da', rate: 900 },
  KERAMZIT: { gen: 'керамзитоблока', label: 'Керамзитоблок', wall: '#c9b9a6', rate: 920 },
  KIRPICH: { gen: 'кирпича', label: 'Кирпич', wall: '#b9684f', rate: 1150 },
  BRUS: { gen: 'бруса', label: 'Брус', wall: '#c99a5b', rate: 1050 },
  BREVNO: { gen: 'бревна', label: 'Бревно', wall: '#a97c4a', rate: 1100 },
  KARKAS: { gen: 'каркаса', label: 'Каркас', wall: '#e2d7c3', rate: 700 },
  SIP: { gen: 'SIP-панелей', label: 'SIP-панели', wall: '#e8ebee', rate: 750 },
};
export const MATERIALS = Object.keys(MAT) as Material[];
