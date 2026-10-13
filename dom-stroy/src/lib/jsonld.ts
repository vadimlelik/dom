import { originOf, ROOT } from './site';

type City = { subdomain: string; name: string; phone: string; address: string | null; lat: number; lng: number; region: { name: string } };

export const orgLd = (c: City) => ({
  '@context': 'https://schema.org',
  '@type': 'GeneralContractor',
  '@id': `https://${ROOT}/#org`,          // одна сущность на все хосты
  name: 'Строй дом',
  url: originOf(c.subdomain),
  telephone: c.phone,
  address: { '@type': 'PostalAddress', addressCountry: 'BY', addressLocality: c.name, streetAddress: c.address ?? undefined },
  geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng },
  areaServed: [{ '@type': 'City', name: c.name }, { '@type': 'AdministrativeArea', name: c.region.name }],
});
