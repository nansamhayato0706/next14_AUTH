// src/lib/auth.ts
import Credentials from "next-auth/providers/credentials";
import { type AuthOptions } from "next-auth";
import { pool } from "./db"; // ← src/lib/db.ts
import bcrypt from "bcrypt";

// DB から取得するユーザー型（必要最低限）
type DbUser = {
  user_id: number;
  email: string;
  password: string;
  role: string;
};

/*───────────────────────────────────────────────
  NextAuth 設定
───────────────────────────────────────────────*/
export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        /*── ユーザー検索 ───────────────────────*/
        const [rows] = (await pool.query(
          "SELECT user_id, email, password, role FROM users WHERE email = ? LIMIT 1",
          [credentials.email]
        )) as [DbUser[], any];

        if (!rows.length) return null;
        const user = rows[0];

        /*── パスワード照合 ────────────────────*/
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        /*── 認証成功 → User オブジェクト返却 ─*/
        return {
          id: String(user.user_id), // 文字列で返すのが NextAuth 推奨
          email: user.email,
          role: user.role, // ← 追加！
        };
      },
    }),
  ],

  /*── セッション設定 ─────────────────────────*/
  session: {
    strategy: "jwt", // JWT 方式
    maxAge: 60 * 60 * 24 * 30, // 30 日
  },

  /*── JWT / Session へ id を埋め込む ──────────*/
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // ← 追加！
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // ← 追加！
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
