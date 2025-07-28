// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (email, password, created, modified, tm, kana, sex, jobdata_user, human_support, account_number, usage_fee, subsidy, handicap_class, handicap_number, handicap_type, handicap_grade, usage_situation, b_group_id) VALUES (?, ?, NOW(), NOW(), '', '', 0, 0, '', 0, 0, 0, 0, '', 0, 0, 0, 0)",
      [email, hashed]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "登録失敗" }, { status: 500 });
  }
}
