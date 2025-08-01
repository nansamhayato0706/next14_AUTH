// src/app/center/page.tsx
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import type { RowDataPacket } from "mysql2/promise";
import type { CenterMember } from "@/types/centerMemberTypes";
import styles from "./CenterMembersPage.module.css";

// ───────────────────────────────────────────────
// RowDataPacket を交差させて型エラーを回避
type CenterMemberRow = CenterMember & RowDataPacket;

// DB からメンバー一覧を取得
async function getCenterMembers(): Promise<CenterMember[]> {
  const [rows] = await pool.query<CenterMemberRow[]>(
    "SELECT * FROM center_members ORDER BY member_id"
  );
  return rows as CenterMember[];
}

// ───────────────────────────────────────────────
// ページ本体（デフォルトでサーバーコンポーネント）
export default async function CenterMembersPage() {
  // 未ログインなら /auth/login へリダイレクト
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  // データ取得
  const members = await getCenterMembers();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>センターメンバー一覧</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>氏名</th>
            <th>住所</th>
            <th>電話</th>
            <th>携帯</th>
            <th>誕生日</th>
            <th>障害区分</th>
            <th>更新日時</th>
          </tr>
        </thead>

        <tbody>
          {members.map((m) => (
            <tr key={m.member_id}>
              <td>{m.member_id}</td>
              <td>
                {/* 詳細ページを用意する場合はリンクに */}
                <Link href={`/center/${m.member_id}`}>{m.name}</Link>
              </td>
              <td>{m.address ?? "-"}</td>
              <td>{m.tel ?? "-"}</td>
              <td>{m.mobile_phone ?? "-"}</td>
              <td>{m.birthday ?? "-"}</td>
              <td>{m.type_of_disability}</td>
              <td>{m.updated_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
