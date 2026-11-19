import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// allows all to access the api
// May be changed in the future to limit to specific origins

// NOTE: this file MUST live at the project root (same level as `app/`).
// Next.js 16 only picks up `<root>/proxy.ts` — a copy inside `app/` is ignored,
// which meant preflights fell through to Next's default 204 with no CORS headers.

const DEFAULT_ALLOWED_HEADERS = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'

export function proxy(request: NextRequest) {
    // Echo the request origin so "allow all" still works when credentials/cookies are sent
    // (`Access-Control-Allow-Origin: *` is rejected by browsers alongside credentials).
    const origin = request.headers.get('origin') ?? '*'

    if (request.method === 'OPTIONS') {
        // Echo back whatever headers the browser asked for, so custom headers
        // (e.g. Authorization for API keys) never fail preflight.
        const requestedHeaders = request.headers.get('access-control-request-headers')
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': requestedHeaders ?? DEFAULT_ALLOWED_HEADERS,
                'Access-Control-Max-Age': '86400',
                'Vary': 'Origin',
            },
        })
    }

    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', DEFAULT_ALLOWED_HEADERS)
    response.headers.set('Vary', 'Origin')
    return response
}

export const config = {
  matcher: ['/api/((?!files/upload).*)'], // Exclude uploads to avoid the 10mb limit that nextrjs has on proxies
}
