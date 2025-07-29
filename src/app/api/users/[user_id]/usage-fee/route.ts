// src/app/api/users/[user_id]/usage-fee/route.ts

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = parseInt(params.user_id, 10);
    const [rows] = await pool.query(
      "SELECT * FROM usage_fee WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("UsageFee GET error:", error);
    return NextResponse.json(
      { error: "利用料金の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = parseInt(params.user_id, 10);
    const body = await request.json();
    const { start_date, end_date, monthly_fee } = body;

    const [result]: any = await pool.query(
      "INSERT INTO usage_fee (user_id, start_date, end_date, monthly_fee) VALUES (?, ?, ?, ?)",
      [userId, start_date, end_date, monthly_fee]
    );

    const newRecord = {
      id: result.insertId,
      user_id: userId,
      start_date,
      end_date,
      monthly_fee,
    };
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("UsageFee POST error:", error);
    return NextResponse.json(
      { error: "利用料金の作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = parseInt(params.user_id, 10);
    const body = await request.json();
    const { id, start_date, end_date, monthly_fee } = body;

    await pool.query(
      "UPDATE usage_fee SET start_date = ?, end_date = ?, monthly_fee = ? WHERE id = ? AND user_id = ?",
      [start_date, end_date, monthly_fee, id, userId]
    );

    return NextResponse.json({
      id,
      user_id: userId,
      start_date,
      end_date,
      monthly_fee,
    });
  } catch (error) {
    console.error("UsageFee PUT error:", error);
    return NextResponse.json(
      { error: "利用料金の更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = parseInt(params.user_id, 10);
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: "IDが指定されていません" },
        { status: 400 }
      );
    }
    const id = parseInt(idParam, 10);

    await pool.query("DELETE FROM usage_fee WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);
    return NextResponse.json({ message: "利用料金が削除されました" });
  } catch (error) {
    console.error("UsageFee DELETE error:", error);
    return NextResponse.json(
      { error: "利用料金の削除に失敗しました" },
      { status: 500 }
    );
  }
}
