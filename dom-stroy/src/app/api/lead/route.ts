import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? '').trim().slice(0, 100);
  const phone = String(b?.phone ?? '').trim().slice(0, 30);
  if (!name || phone.replace(/\D/g, '').length < 9) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const city = await db.city.findUnique({ where: { subdomain: String(b?.city ?? 'main') } });
  await db.lead.create({ data: { name, phone, page: String(b?.page ?? '').slice(0, 300), cityId: city?.id } });

  const { TELEGRAM_BOT_TOKEN: t, TELEGRAM_CHAT_ID: chat } = process.env;
  if (t && chat) {
    await fetch(`https://api.telegram.org/bot${t}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: `Заявка (${city?.name ?? '—'})\n${name}\n${phone}\n${b?.page ?? ''}` }),
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
