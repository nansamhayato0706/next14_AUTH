// src/app/api/users/[user_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/*───────────────────────────────────────────────
  GET  /api/users/[user_id]
  ─ ユーザー 1 件を取得（usage_fee / payment_period を JOIN）
───────────────────────────────────────────────*/
export async function GET(
  _req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const user_id = parseInt(params.user_id, 10);

  try {
    const [rows] = await pool.query(
      `
      SELECT
        u.*,
        uf.start_date AS usage_start_date,
        uf.end_date   AS usage_end_date,
        pp.start_date AS payment_start_date,
        pp.end_date   AS payment_end_date
      FROM users u
      LEFT JOIN usage_fee      uf ON uf.user_id = u.user_id
        AND uf.id = (SELECT MAX(id) FROM usage_fee      WHERE user_id = u.user_id)
      LEFT JOIN payment_period pp ON pp.user_id = u.user_id
        AND pp.id = (SELECT MAX(id) FROM payment_period WHERE user_id = u.user_id)
      WHERE u.user_id = ?
      `,
      [user_id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("ユーザー取得エラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

/*───────────────────────────────────────────────
  PUT  /api/users/[user_id]
  ─ フォームで送られたフィールドだけを更新
───────────────────────────────────────────────*/
export async function PUT(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const user_id = parseInt(params.user_id, 10);
  const body = await req.json();

  /* 更新を許可するカラム一覧 */
  const ALLOWED_FIELDS = [
    "last_name",
    "first_name",
    "last_name_kana",
    "first_name_kana",
    "sex",
    "birthday",
    "email",
    "mobile_phone",
    "phone_number",
    "postcode",
    "city",
    "block",
    "building",
    "receiving_number",
    "work_place",
    "usage_situation",
    "start_date",
    "end_date",
    "remarks",
    "human_support",
  ] as const;

  /* 動的に SET 句を構築 */
  const setParts: string[] = [];
  const values: any[] = [];

  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      setParts.push(`${key} = ?`);
      // 空文字や undefined は NULL に変換
      const v = body[key] === "" || body[key] === undefined ? null : body[key];
      values.push(v);
    }
  }

  if (setParts.length === 0) {
    return NextResponse.json(
      { error: "更新フィールドがありません" },
      { status: 400 }
    );
  }

  values.push(user_id); // WHERE 句用

  try {
    await pool.query(
      `UPDATE users SET ${setParts.join(", ")} WHERE user_id = ?`,
      values
    );
    return NextResponse.json({ message: "更新完了" });
  } catch (error) {
    console.error("更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
