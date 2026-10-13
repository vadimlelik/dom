'use client';
import { useState } from 'react';
import { MAT, MATERIALS } from '@/lib/materials';
import LeadForm from './LeadForm';

const fmt = (n: number) => new Intl.NumberFormat('ru-BY').format(Math.round(n / 1000) * 1000);

export default function Calculator({ city, coef, name }: { city: string; coef: number; name: string }) {
  const [mat, setMat] = useState(MATERIALS[0]);
  const [area, setArea] = useState(120);
  const [floors, setFloors] = useState(1);
  const [turnkey, setTurnkey] = useState(true);

  const base = MAT[mat].rate * area * coef * (floors === 2 ? 0.94 : 1) * (turnkey ? 1 : 0.62);
  return (
    <section className="block calc" id="raschet">
      <h2>Сколько стоит дом {name}</h2>
      <div className="calc-grid">
        <div className="calc-in">
          <label>Материал стен
            <select value={mat} onChange={(e) => setMat(e.target.value as typeof mat)}>
              {MATERIALS.map((m) => <option key={m} value={m}>{MAT[m].label}</option>)}
            </select>
          </label>
          <label>Площадь: {area} м²
            <input type="range" min={40} max={300} step={5} value={area} onChange={(e) => setArea(+e.target.value)} />
          </label>
          <label>Этажность
            <select value={floors} onChange={(e) => setFloors(+e.target.value)}>
              <option value={1}>1 этаж</option><option value={2}>2 этажа</option>
            </select>
          </label>
          <label>Комплектация
            <select value={turnkey ? 'k' : 'b'} onChange={(e) => setTurnkey(e.target.value === 'k')}>
              <option value="k">Под ключ</option><option value="b">Под черновую отделку</option>
            </select>
          </label>
        </div>
        <div className="calc-out" aria-live="polite">
          <p>Ориентировочно</p>
          <strong>{fmt(base * 0.93)} – {fmt(base * 1.07)} руб</strong>
          <small>Точную смету с фиксацией цены составим после выезда на участок.</small>
          <LeadForm city={city} />
        </div>
      </div>
    </section>
  );
}
