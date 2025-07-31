import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    console.log("middleware token:", token);
    const { pathname } = req.nextUrl;

    // トップページアクセス時の処理
    if (pathname === "/") {
      if (token?.role === "admin") {
        return NextResponse.next(); // 管理者はトップページへ
      }

      // 一般ユーザー → /users/home にパラメータ付きでリダイレクト
      const t = token as { id?: string; email?: string; role?: string };

      const phpUrl = new URL("/users/home", req.nextUrl.origin);
      phpUrl.searchParams.set("email", t.email ?? "");
      phpUrl.searchParams.set("id", t.id ?? "");
      phpUrl.searchParams.set("role", t.role ?? "user");

      return NextResponse.redirect(phpUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/users/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|auth/login|api/auth).*)",
  ],
};
