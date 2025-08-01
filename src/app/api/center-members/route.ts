// src/app/api/center-members/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") ?? ""; // あいまい検索文字列
  const dis = searchParams.get("disability") ?? ""; // 障害区分
  const tel = searchParams.get("tel") ?? ""; // TEL 部分一致
  const page = Number(searchParams.get("page") ?? "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  // 動的 SQL（LIKE 句はパラメータバインドで安全に）
  let sql = `
    SELECT * FROM center_members
    WHERE 1 = 1
      AND (name LIKE ? OR name_kana LIKE ? OR address LIKE ?)
  `;
  const params: (string | number)[] = [`%${q}%`, `%${q}%`, `%${q}%`];

  if (dis) {
    sql += " AND type_of_disability = ?";
    params.push(dis);
  }
  if (tel) {
    sql += " AND tel LIKE ?";
    params.push(`%${tel}%`);
  }

  sql += " ORDER BY member_id LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return NextResponse.json(rows);
}
