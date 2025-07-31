"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // ログインページではナビゲーションを表示しない
  if (pathname === "/auth/login") {
    return null;
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {/* ロゴ・タイトル */}
        <Link href="/" className={styles.logo}>
          ユーザー管理システム
        </Link>

        {/* メニューリンク */}
        <div className={styles.menu}>
          <Link
            href="/"
            className={`${styles.menuItem} ${
              pathname === "/" ? styles.active : ""
            }`}
          >
            ホーム
          </Link>
          <Link
            href="/users"
            className={`${styles.menuItem} ${
              pathname === "/users" ? styles.active : ""
            }`}
          >
            ユーザー一覧
          </Link>
          {/* 他のページも必要に応じて追加 */}
        </div>

        {/* ユーザー情報・ログアウト */}
        <div className={styles.userInfo}>
          {session?.user?.email && (
            <span className={styles.userEmail}>{session.user.email}</span>
          )}
          <button
            className={styles.logoutButton}
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            ログアウト
          </button>
        </div>
      </div>
    </nav>
  );
}
