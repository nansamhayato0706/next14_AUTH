// /src/middleware.ts でも /middleware.ts でも OK
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/auth/login" },
  callbacks: {
    authorized({ token }) {
      // token が無ければ未認証と判定
      return !!token;
    },
  },
});

/* ---- “どの URL を保護するか” ---- */
export const config = {
  matcher: [
    // ① API 全体
    "/api/:path*",

    // ② ルート / をピンポイントで追加
    "/",

    // ③ それ以外のアプリページ
    "/((?!_next/static|_next/image|favicon.ico|auth/login|api/auth).*)",
  ],
};
