// src/lib/auth.ts
import Credentials from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { pool } from "./db"; // ← これは src/lib/db.ts です
import bcrypt from "bcrypt";

// DBから取得するユーザー型（必要最低限）
type DbUser = {
  user_id: number;
  email: string;
  password: string;
};

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // ユーザー検索
        const [rows] = (await pool.query(
          "SELECT user_id, email, password FROM users WHERE email = ?",
          [credentials.email]
        )) as [DbUser[], any];

        if (!rows.length) return null;

        const user = rows[0];

        // パスワード検証
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        // 認証成功 → セッションに含めるユーザー情報を返す
        return { id: user.user_id.toString(), email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt", // JWT方式
    maxAge: 60 * 60 * 24 * 30, // 30日間
  },
  secret: process.env.NEXTAUTH_SECRET,
};
