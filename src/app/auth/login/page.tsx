"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@jigyodan.or.jp");
  const [password, setPassword] = useState("hanaziboo0706");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/", // ✅ ここでログイン成功後に /users へ移動
    });

    // redirect: true を指定すると自動遷移されるのでここでは特に処理しない
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border shadow rounded">
      <h1 className="text-2xl mb-4 text-center">ログイン</h1>

      <input
        className="border w-full mb-3 p-2 rounded"
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border w-full mb-3 p-2 rounded"
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        ログイン
      </button>
    </div>
  );
}
