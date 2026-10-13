'use client';
import { useState } from 'react';

export default function LeadForm({ city }: { city: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, city, page: location.href }),
    });
    setState(res.ok ? 'ok' : 'error');
  }

  if (state === 'ok') return <p className="ok">Заявка принята. Перезвоним в рабочее время.</p>;
  return (
    <form onSubmit={onSubmit} className="lead">
      <label>Имя<input name="name" required autoComplete="name" /></label>
      <label>Телефон<input name="phone" type="tel" required autoComplete="tel" placeholder="+375" /></label>
      <button disabled={state === 'sending'}>Рассчитать стоимость</button>
      {state === 'error' && <p className="err">Не отправилось. Позвоните нам по номеру в шапке.</p>}
    </form>
  );
}
