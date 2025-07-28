import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import { toWareki } from "@/lib/utils/date";
import { UserRow } from "@/types/userTypes";
import styles from "@/app/users/[user_id]/EditUserPage.module.css";

// DBからユーザー1件を取得する関数
async function getUser(user_id: string): Promise<UserRow | null> {
  const [rows] = await pool.query(
    `
    SELECT
      u.*, 
      uf.start_date AS usage_start_date,
      uf.end_date AS usage_end_date,
      pp.start_date AS payment_start_date,
      pp.end_date AS payment_end_date
    FROM users u
    LEFT JOIN usage_fee uf
      ON uf.user_id = u.user_id
      AND uf.id = (
        SELECT MAX(id) FROM usage_fee WHERE user_id = u.user_id
      )
    LEFT JOIN payment_period pp
      ON pp.user_id = u.user_id
      AND pp.id = (
        SELECT MAX(id) FROM payment_period WHERE user_id = u.user_id
      )
    WHERE u.user_id = ?
    `,
    [user_id]
  );

  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0] as UserRow;
}

type PageProps = {
  params: {
    user_id: string;
  };
};

export default async function UserDetailPage({ params }: PageProps) {
  const user = await getUser(params.user_id);
  if (!user) return notFound();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>ユーザー詳細</h1>
      <div>
        <p>
          <strong>氏名:</strong> {user.last_name} {user.first_name}
        </p>
        <p>
          <strong>ふりがな:</strong> {user.last_name_kana}{" "}
          {user.first_name_kana}
        </p>
        <p>
          <strong>メールアドレス:</strong> {user.email}
        </p>
        <p>
          <strong>住所:</strong> {user.city}
          {user.block}
          {user.building}
        </p>
        <p>
          <strong>電話番号:</strong> {user.mobile_phone || user.phone_number}
        </p>
        <p>
          <strong>利用開始日:</strong> {toWareki(user?.usage_start_date)}
        </p>
        <p>
          <strong>利用終了日:</strong> {toWareki(user?.usage_end_date)}
        </p>
        <p>
          <strong>支給開始日:</strong> {toWareki(user?.payment_start_date)}
        </p>
        <p>
          <strong>支給終了日:</strong> {toWareki(user?.payment_end_date)}
        </p>
        <p>
          <strong>作業者種別:</strong> {user.user_type_id}
        </p>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <a href={`/users/${user.user_id}/edit`} className={styles.button}>
          編集する
        </a>
      </div>
    </main>
  );
}
