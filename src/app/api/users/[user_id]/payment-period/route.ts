import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface PaymentPeriod {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = parseInt(params.user_id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "無効なユーザーIDです" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM payment_period WHERE user_id = ? ORDER BY start_date DESC",
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

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "無効なユーザーIDです" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { start_date, end_date } = body;

    // バリデーション
    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: "開始日と終了日は必須です" },
        { status: 400 }
      );
    }

    // 日付の妥当性チェック
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "無効な日付形式です" },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "開始日は終了日より前である必要があります" },
        { status: 400 }
      );
    }

    // 重複チェック（期間が重複しないかチェック）
    const [existingPeriods] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM payment_period 
       WHERE user_id = ? 
       AND ((start_date <= ? AND end_date >= ?) 
            OR (start_date <= ? AND end_date >= ?)
            OR (start_date >= ? AND end_date <= ?))`,
      [userId, start_date, start_date, end_date, end_date, start_date, end_date]
    );

    if (existingPeriods.length > 0) {
      return NextResponse.json(
        { error: "指定された期間は既存の支給期間と重複しています" },
        { status: 409 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO payment_period (user_id, start_date, end_date) VALUES (?, ?, ?)",
      [userId, start_date, end_date]
    );

    // 作成されたレコードを取得
    const [newRecord] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM payment_period WHERE id = ?",
      [result.insertId]
    );

    return NextResponse.json(newRecord[0], { status: 201 });
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

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "無効なユーザーIDです" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { id, start_date, end_date } = body;

    // バリデーション
    if (!id || !start_date || !end_date) {
      return NextResponse.json(
        { error: "ID、開始日、終了日は必須です" },
        { status: 400 }
      );
    }

    // 日付の妥当性チェック
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "無効な日付形式です" },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "開始日は終了日より前である必要があります" },
        { status: 400 }
      );
    }

    // レコードの存在確認
    const [existingRecord] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM payment_period WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: "指定された支給期間が見つかりません" },
        { status: 404 }
      );
    }

    // 重複チェック（自分以外のレコードとの重複）
    const [conflictingPeriods] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM payment_period 
       WHERE user_id = ? AND id != ?
       AND ((start_date <= ? AND end_date >= ?) 
            OR (start_date <= ? AND end_date >= ?)
            OR (start_date >= ? AND end_date <= ?))`,
      [
        userId,
        id,
        start_date,
        start_date,
        end_date,
        end_date,
        start_date,
        end_date,
      ]
    );

    if (conflictingPeriods.length > 0) {
      return NextResponse.json(
        { error: "指定された期間は既存の支給期間と重複しています" },
        { status: 409 }
      );
    }

    await pool.query(
      "UPDATE payment_period SET start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      [start_date, end_date, id, userId]
    );

    // 更新されたレコードを取得
    const [updatedRecord] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM payment_period WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    return NextResponse.json(updatedRecord[0]);
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

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "無効なユーザーIDです" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "有効なIDが指定されていません" },
        { status: 400 }
      );
    }

    // レコードの存在確認
    const [existingRecord] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM payment_period WHERE id = ? AND user_id = ?",
      [parseInt(id), userId]
    );

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: "指定された支給期間が見つかりません" },
        { status: 404 }
      );
    }

    await pool.query(
      "DELETE FROM payment_period WHERE id = ? AND user_id = ?",
      [parseInt(id), userId]
    );

    return NextResponse.json({
      message: "支給期間が削除されました",
      deleted_record: existingRecord[0],
    });
  } catch (error) {
    console.error("支給期間削除エラー:", error);
    return NextResponse.json(
      { error: "支給期間の削除に失敗しました" },
      { status: 500 }
    );
  }
}
