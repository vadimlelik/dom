import { NextRequest, NextResponse } from 'next/server';

const ROOT = process.env.ROOT_DOMAIN ?? 'dom-stroy.by';

// orsha.dom-stroy.by/uslugi -> /sites/orsha/uslugi ; dom-stroy.by -> /sites/main
export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').split(':')[0];

  if (host === `www.${ROOT}`) {
    const url = req.nextUrl.clone();
    url.host = ROOT;
    return NextResponse.redirect(url, 301);
  }

  const dev = host.endsWith('.localhost') ? host.replace('.localhost', '') : null;
  const sub = dev ?? (host.endsWith(`.${ROOT}`) ? host.slice(0, -(ROOT.length + 1)) : null);
  const site = sub || 'main';

  const url = req.nextUrl.clone();
  url.pathname = `/sites/${site}${url.pathname === '/' ? '' : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: ['/((?!_next|api|favicon.ico).*)'] };
