// src/app/api/users/[user_id]/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // 既存の NextAuth 設定

export async function PUT(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  const userId = parseInt(params.user_id, 10);

  // 🔐 認可チェック（自分自身のみ／管理者のみなど、必要に応じて修正）
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user?.id) !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword, confirmPassword } = await req.json();

  // --- バリデーション ---
  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "全て必須です" }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "新しいパスワードが一致しません" },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "パスワードは8文字以上" },
      { status: 400 }
    );
  }

  try {
    // 現在のハッシュを取得
    const [rows] = (await pool.query(
      "SELECT password FROM users WHERE user_id = ?",
      [userId]
    )) as any[];

    if (!rows?.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: hashInDb } = rows[0];

    // 現在のパスワードが正しいか確認
    const ok = await compare(currentPassword, hashInDb);
    if (!ok) {
      return NextResponse.json(
        { error: "現在のパスワードが違います" },
        { status: 400 }
      );
    }

    // 新しいパスワードをハッシュ化して更新
    const newHash = await hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = ?, modified = NOW() WHERE user_id = ?",
      [newHash, userId]
    );

    return NextResponse.json({ message: "パスワードを変更しました" });
  } catch (err) {
    console.error("Password update error:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
