// src/app/auth/register/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      alert("登録成功");
      router.push("/auth/login");
    } else {
      alert("登録失敗");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">ユーザー登録</h1>
      <input
        className="border w-full mb-2 p-2"
        placeholder="メール"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border w-full mb-4 p-2"
        placeholder="パスワード"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2"
        onClick={handleRegister}
      >
        登録
      </button>
    </div>
  );
}
