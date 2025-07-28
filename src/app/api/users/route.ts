// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
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
      ORDER BY u.user_id ASC;
      `
    );

    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
