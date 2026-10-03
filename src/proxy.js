import { NextResponse } from 'next/server';
import { getAnglesApiBaseUrl } from './utils/runtime-config';

/*
 * Security headers for every page.
 *
 * - Content-Security-Policy with a per-request nonce. Next.js reads the nonce from the
 *   request's CSP header and puts it on its own scripts; RuntimeConfigScript reads it from
 *   `x-nonce`. Scripts without it - anything injected into a page - do not run.
 * - `frame-ancestors 'none'` and X-Frame-Options: the UI cannot be framed by another site,
 *   so it cannot be used for clickjacking.
 * - `form-action 'self'`: a form can only submit to the UI itself, never off-site.
 *
 * The API is on another origin in most deployments and its URL is only known at runtime
 * (ANGLES_API_BASE_URL), which is why this is built per request here rather than as a
 * static header in next.config.mjs.
 */

// The origin (scheme, host and port) of a configured URL, or undefined if it is not one.
const originOf = (url) => {
  try {
    return new URL(url).origin;
  } catch (error) {
    return undefined;
  }
};

export const buildContentSecurityPolicy = (nonce, apiOrigin, isDev) => {
  const connect = ["'self'", apiOrigin].filter(Boolean).join(' ');
  return [
    "default-src 'self'",
    // 'strict-dynamic' lets the nonced Next.js runtime load the page's other chunks. In
    // development React needs eval for its error overlays; production does not.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // rsuite and ApexCharts set inline styles at runtime, which a nonce cannot cover.
    "style-src 'self' 'unsafe-inline'",
    // Screenshots arrive as data: URIs; attachments are shown from blob: URLs.
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "font-src 'self' data:",
    `connect-src ${connect}`,
    // HTML snapshots are shown in a srcdoc iframe, which inherits this policy.
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
};

export function proxy(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const csp = buildContentSecurityPolicy(nonce, originOf(getAnglesApiBaseUrl()), isDev);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  // For browsers that predate frame-ancestors.
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: static chunks, images and public assets need no policy.
      source: '/((?!_next/static|_next/image|favicon.png|assets/|manifest.json|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
