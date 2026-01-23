import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("nahidhasanalimchattingweb")?.value;

  if (pathname.startsWith("/") || pathname.startsWith("/components/profile")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/components/login", request.url)
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(
        new URL("/components/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/components/profile"],
};
