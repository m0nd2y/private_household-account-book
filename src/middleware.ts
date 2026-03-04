import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API 라우트와 정적 파일은 통과
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // 루트 경로는 404 표시 (사이트 숨김)
  if (pathname === "/") {
    return new NextResponse("Not Found", { status: 404 })
  }

  // 해시 URL 검증
  const secretHash = process.env.SECRET_HASH
  if (!secretHash) {
    return new NextResponse("Server Error", { status: 500 })
  }

  const pathSegments = pathname.split("/").filter(Boolean)
  const hash = pathSegments[0]

  if (hash !== secretHash) {
    return new NextResponse("Not Found", { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
