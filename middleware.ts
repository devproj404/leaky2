import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Simply pass through all requests to Next.js routing
  return NextResponse.next()
}

// Only run middleware on specific paths if needed in the future
export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
