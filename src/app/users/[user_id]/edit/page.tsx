// src/app/users/[user_id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { UserRow } from "@/types/userTypes";
import styles from "@/app/users/[user_id]/EditUserPage.module.css";

export default function EditUserPage() {
  const router = useRouter();
  const { user_id } = useParams();
  const [form, setForm] = useState<Partial<UserRow>>({});

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`/api/users/${user_id}`);
      const data = await res.json();
      setForm(data);
    };
    fetchUser();
  }, [user_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/users/${user_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/");
  };

  if (!form) return <p>読み込み中...</p>;

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>ユーザー情報編集</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          name="last_name"
          value={form.last_name || ""}
          onChange={handleChange}
          placeholder="姓"
        />
        <input
          className={styles.input}
          name="first_name"
          value={form.first_name || ""}
          onChange={handleChange}
          placeholder="名"
        />
        <input
          className={styles.input}
          name="email"
          value={form.email || ""}
          onChange={handleChange}
          placeholder="メールアドレス"
        />
        <input
          className={styles.input}
          name="mobile_phone"
          value={form.mobile_phone || ""}
          onChange={handleChange}
          placeholder="携帯番号"
        />
        <button type="submit" className={styles.button}>
          保存
        </button>
      </form>
    </main>
  );
}
