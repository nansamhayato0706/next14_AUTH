// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  /** JWT に追加する独自クレーム */
  interface JWT {
    id?: string;
    role?: string; // ← role を追加
  }

  /** `useSession()`・`getServerSession()` で返る Session */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string; // ← role を追加
    };
  }

  /** authorize() が返す User も合わせて定義しておくと便利 */
  interface User {
    id: string;
    role?: string; // ← role を追加
  }
}
