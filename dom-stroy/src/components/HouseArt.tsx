import type { Material } from '@prisma/client';
import { MAT } from '@/lib/materials';

// Иллюстрация-заглушка в стиле чертежа. Если у объекта есть фото в MinIO, показываем его (см. Photo).
export default function HouseArt({ material, floors, w = 6 }: { material: Material; floors: number; w?: number }) {
  const wallH = 46 * floors, bw = 120 + (w % 4) * 14, x = (320 - bw) / 2, base = 190, top = base - wallH;
  const wins = Array.from({ length: floors }).flatMap((_, f) =>
    [0, 1, 2].map((i) => <rect key={`${f}${i}`} x={x + 16 + i * ((bw - 32) / 3 + 3)} y={top + 10 + f * 46} width={(bw - 32) / 3 - 8} height={20} fill="none" stroke="#13202e" strokeWidth="1.5" />));
  return (
    <svg viewBox="0 0 320 210" role="img" aria-label={`${MAT[material].label}, ${floors} эт.`} className="art">
      <line x1="10" y1={base} x2="310" y2={base} stroke="#13202e" strokeWidth="2" />
      <rect x={x} y={top} width={bw} height={wallH} fill={MAT[material].wall} stroke="#13202e" strokeWidth="2" />
      <polygon points={`${x - 12},${top} ${x + bw / 2},${top - 44} ${x + bw + 12},${top}`} fill="#13202e" />
      {wins}
      <rect x={x + bw / 2 - 9} y={base - 30} width="18" height="30" fill="#1f4fbf" />
    </svg>
  );
}
