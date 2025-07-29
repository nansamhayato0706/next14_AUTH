import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = parseInt(params.user_id);
    const [rows] = await pool.query(
      "SELECT * FROM payment_period WHERE user_id = ?",
      [userId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("支給期間取得エラー:", error);
    return NextResponse.json(
      { error: "支給期間の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = parseInt(params.user_id);
    const { start_date, end_date } = await request.json();

    const [result] = await pool.query(
      "INSERT INTO payment_period (user_id, start_date, end_date) VALUES (?, ?, ?)",
      [userId, start_date, end_date]
    );

    return NextResponse.json(
      {
        id: (result as any).insertId,
        user_id: userId,
        start_date,
        end_date,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("支給期間作成エラー:", error);
    return NextResponse.json(
      { error: "支給期間の作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = parseInt(params.user_id);
    const { id, start_date, end_date } = await request.json();

    await pool.query(
      "UPDATE payment_period SET start_date = ?, end_date = ? WHERE id = ? AND user_id = ?",
      [start_date, end_date, id, userId]
    );

    return NextResponse.json({
      id,
      user_id: userId,
      start_date,
      end_date,
    });
  } catch (error) {
    console.error("支給期間更新エラー:", error);
    return NextResponse.json(
      { error: "支給期間の更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = parseInt(params.user_id);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "IDが指定されていません" },
        { status: 400 }
      );
    }

    await pool.query(
      "DELETE FROM payment_period WHERE id = ? AND user_id = ?",
      [parseInt(id), userId]
    );

    return NextResponse.json({ message: "支給期間が削除されました" });
  } catch (error) {
    console.error("支給期間削除エラー:", error);
    return NextResponse.json(
      { error: "支給期間の削除に失敗しました" },
      { status: 500 }
    );
  }
}
