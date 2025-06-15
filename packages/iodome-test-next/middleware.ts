import { NextRequest, NextResponse } from "next/server";
import { SIGN_IN_PATH } from "./utils/constants";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = SIGN_IN_PATH;
  const sessionId = request.cookies.get("sessionId");

  if (!sessionId) {
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/articles/:path*"],
};
