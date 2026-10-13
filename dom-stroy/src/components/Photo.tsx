import type { Material } from '@prisma/client';
import HouseArt from './HouseArt';

const IMG = process.env.NEXT_PUBLIC_IMG_BASE ?? 'https://img.dom-stroy.by';

export default function Photo({ images, material, floors, w }: { images: string[]; material: Material; floors: number; w?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (images[0]) return <img className="art" src={`${IMG}/${images[0]}`} alt="" loading="lazy" decoding="async" />;
  return <HouseArt material={material} floors={floors} w={w} />;
}
