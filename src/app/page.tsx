"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { UserRow } from "@/types/userTypes";
import styles from "./UsersPage.module.css";
import { toWareki } from "@/lib/utils/date";
import Link from "next/link"; // 🔽 追加

export default function UsersPage() {
  /* 🔐 ログイン情報 */
  const { data: session } = useSession();

  /* 状態 */
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usageFilter, setUsageFilter] = useState<"all" | 0 | 2>(0);
  const [typeFilter, setTypeFilter] = useState<"all" | 1 | 2 | 5 | 6>(1);

  /* データ取得 */
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    })();
  }, []);

  const filteredUsers = users.filter((u) => {
    const usageOk = usageFilter === "all" || u.usage_situation === usageFilter;
    const typeOk = typeFilter === "all" || u.user_type_id === typeFilter;
    return usageOk && typeOk;
  });

  return (
    <main className={styles.main}>
      {/* --- header --- */}
      <div className={styles.header}>
        <span>ログイン中: {session?.user?.email ?? "ゲストユーザー"}</span>
        <button
          className={styles.logout}
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          ログアウト
        </button>
      </div>

      <h1 className={styles.heading}>ユーザー一覧</h1>

      {/* --- filters --- */}
      <div className={styles.filters}>
        {/* ステータス */}
        <div className={styles.filterGroup}>
          <span className={styles.label}>ステータス:</span>
          <div className={styles.buttonGroup}>
            {(["all", 0, 2] as const).map((v) => (
              <button
                key={v}
                className={`${styles.button} ${
                  usageFilter === v ? styles.activeBlue : ""
                }`}
                onClick={() => setUsageFilter(v)}
              >
                {v === "all" ? "全て" : v === 0 ? "利用中" : "退所者"}
              </button>
            ))}
          </div>
        </div>

        {/* 作業者種別 */}
        <div className={styles.filterGroup}>
          <label htmlFor="userType" className={styles.label}>
            作業者種別:
          </label>
          <select
            id="userType"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(
                e.target.value === "all"
                  ? "all"
                  : (parseInt(e.target.value) as 1 | 2 | 5 | 6)
              )
            }
            className={styles.select}
          >
            <option value="all">全て</option>
            <option value="1">利用者</option>
            <option value="2">一般</option>
            <option value="5">事業所</option>
            <option value="6">移行支援事業所</option>
          </select>
        </div>
      </div>

      {/* --- table --- */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.cell}>No</th>
              <th className={styles.cell}>名前</th>
              <th className={styles.cell}>住所</th>
              <th className={styles.cell}>電話番号</th>
              <th className={styles.cell}>利用料終了日</th>
              <th className={styles.cell}>支給終了日</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={u.user_id}>
                <td
                  className={`${styles.cell} ${styles.cellCenter}`}
                  title={String(u.user_id)}
                >
                  {i + 1}
                </td>
                <td className={styles.cell}>
                  {/* 🔽 名前クリックで編集ページへ遷移 */}
                  <Link href={`/users/${u.user_id}`} className={styles.link}>
                    {u.last_name} {u.first_name}
                  </Link>
                </td>
                <td className={styles.cell}>
                  {[u.city, u.block, u.building].filter(Boolean).join(" ")}
                </td>
                <td className={styles.cell}>{u.mobile_phone ?? ""}</td>
                <td className={styles.cell}>{toWareki(u.usage_end_date)}</td>
                <td className={styles.cell}>{toWareki(u.payment_end_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
