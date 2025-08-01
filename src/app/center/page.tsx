// src/app/center/page.tsx
"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import debounce from "lodash.debounce";
import type { CenterMember } from "@/types/centerMemberTypes";
import styles from "./CenterMembersPage.module.css";

/*───────────────────────────────────────────────
  共通 fetcher
───────────────────────────────────────────────*/
const fetcher = async <T = unknown,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}\n${text}`);
  }
  return res.json();
};

export default function CenterMembersPage() {
  /*────────── 検索フォームの状態 ──────────*/
  const [keyword, setKeyword] = useState("");
  const [disability, setDisability] = useState("");

  // 入力を 300 ms デバウンスして API 連発を防ぐ
  const onChangeKeyword = debounce((v: string) => setKeyword(v), 300);

  /*────────── SWR キー(URL)を生成 ──────────*/
  const url = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("q", keyword);
    sp.set("disability", disability);
    return `/api/center-members?${sp.toString()}`;
  }, [keyword, disability]);

  /*────────── データ取得 ─────────────────*/
  const {
    data = [], // fallbackData を空配列扱い
    error,
    isLoading,
  } = useSWR<CenterMember[], Error>(url, fetcher, {
    keepPreviousData: true,
  });

  /*────────── UI 分岐 ────────────────────*/
  if (error) return <pre className={styles.error}>エラー: {error.message}</pre>;
  if (isLoading) return <p className={styles.loading}>読み込み中...</p>;

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>センターメンバー検索</h1>

      {/* --- 検索フォーム --- */}
      <div className={styles.filters}>
        <input
          className={styles.input}
          type="text"
          placeholder="氏名・住所など"
          onChange={(e) => onChangeKeyword(e.target.value)}
        />
        <select
          className={styles.select}
          value={disability}
          onChange={(e) => setDisability(e.target.value)}
        >
          <option value="">区分を選択</option>
          <option value="身体">身体</option>
          <option value="知的">知的</option>
          <option value="精神">精神</option>
          <option value="その他">その他</option>
        </select>
      </div>

      {/* --- 検索結果 --- */}
      {data.length === 0 ? (
        <p className={styles.empty}>該当なし</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>氏名</th>
              <th>住所</th>
              <th>電話</th>
              <th>携帯</th>
              <th>誕生日</th>
              <th>障害区分</th>
              <th>更新日時</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.member_id}>
                <td>{m.member_id}</td>
                <td>{m.name}</td>
                <td>{m.address || "-"}</td>
                <td>{m.tel || "-"}</td>
                <td>{m.mobile_phone || "-"}</td>
                <td>{m.birthday || "-"}</td>
                <td>{m.type_of_disability || "-"}</td>
                <td>{m.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
