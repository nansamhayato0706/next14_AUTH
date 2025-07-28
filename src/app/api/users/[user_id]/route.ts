import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// ユーザー詳細取得（+ usage_fee + payment_period）
export async function GET(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const user_id = parseInt(params.user_id, 10);

  try {
    const [rows] = await pool.query(
      `
      SELECT
        u.*,  -- usersテーブルの全カラム
        uf.start_date AS usage_start_date,
        uf.end_date AS usage_end_date,
        pp.start_date AS payment_start_date,
        pp.end_date AS payment_end_date
      FROM users u
      LEFT JOIN usage_fee uf
        ON uf.user_id = u.user_id
        AND uf.id = (
          SELECT MAX(id)
          FROM usage_fee
          WHERE user_id = u.user_id
        )
      LEFT JOIN payment_period pp
        ON pp.user_id = u.user_id
        AND pp.id = (
          SELECT MAX(id)
          FROM payment_period
          WHERE user_id = u.user_id
        )
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

// ユーザー情報更新（既存の PUT はそのままでOK）
export async function PUT(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const user_id = parseInt(params.user_id, 10);
  const data = await req.json();

  const {
    last_name,
    first_name,
    email,
    mobile_phone,
    birthday,
    city,
    block,
    building,
  } = data;

  try {
    await pool.query(
      `
      UPDATE users SET
        last_name = ?,
        first_name = ?,
        email = ?,
        mobile_phone = ?,
        birthday = ?,
        city = ?,
        block = ?,
        building = ?
      WHERE user_id = ?
      `,
      [
        last_name,
        first_name,
        email,
        mobile_phone,
        birthday,
        city,
        block,
        building,
        user_id,
      ]
    );

    return NextResponse.json({ message: "更新完了" });
  } catch (error) {
    console.error("更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
