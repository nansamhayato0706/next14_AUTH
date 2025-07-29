"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UserRow } from "@/types/userTypes";
import styles from "@/app/users/[user_id]/EditUserPage.module.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

export default function EditUserPage() {
  const router = useRouter();
  const { user_id } = useParams();
  const [form, setForm] = useState<Partial<UserRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 日付が1899-11-29の場合を判定するヘルパー関数（文字列ベース）
  const isNullDate = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    // 文字列として直接チェック
    return (
      dateString.includes("1899-11-29") ||
      dateString.includes("1899-11-30") ||
      (dateString.includes("1899") &&
        (dateString.includes("11-29") || dateString.includes("11-30")))
    );
  };

  // 表示用の日付を取得するヘルパー関数
  const getDisplayDate = (
    dateString: string | null | undefined
  ): Date | null => {
    if (!dateString || isNullDate(dateString)) {
      return null;
    }
    return new Date(dateString);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${user_id}`);
        if (!res.ok) throw new Error("ユーザー情報の取得に失敗しました");
        const data = await res.json();
        setForm(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user_id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("更新に失敗しました");
      router.push(`/users/${user_id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/users/${user_id}`);
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>読み込み中...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.errorContainer}>
          <h2>エラーが発生しました</h2>
          <p>{error}</p>
          <button onClick={() => router.push("/")} className={styles.button}>
            ホームに戻る
          </button>
        </div>
      </main>
    );
  }

  if (!form) return null;

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>ユーザー情報編集</h1>
        <p className={styles.subtitle}>必要な情報を更新してください</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 基本情報セクション */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>👤</span>
            基本情報
          </h2>
          <div className={styles.fieldGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                姓 <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                name="last_name"
                value={form.last_name || ""}
                onChange={handleChange}
                placeholder="例：山田"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                名 <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                name="first_name"
                value={form.first_name || ""}
                onChange={handleChange}
                placeholder="例：太郎"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>姓フリガナ</label>
              <input
                className={styles.input}
                name="last_name_kana"
                value={form.last_name_kana || ""}
                onChange={handleChange}
                placeholder="例：ヤマダ"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>名フリガナ</label>
              <input
                className={styles.input}
                name="first_name_kana"
                value={form.first_name_kana || ""}
                onChange={handleChange}
                placeholder="例：タロウ"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>性別</label>
              <select
                className={styles.input}
                name="sex"
                value={form.sex ?? ""}
                onChange={handleChange}
              >
                <option value="">選択してください</option>
                <option value="0">男性</option>
                <option value="1">女性</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>誕生日</label>
              <DatePicker
                selected={getDisplayDate(form.birthday)}
                onChange={(date: Date | null) => {
                  setForm({
                    ...form,
                    birthday: date ? date.toISOString() : "",
                  });
                }}
                className={styles.input}
                dateFormat="yyyy-MM-dd"
                placeholderText="日付を選択"
              />
              {isNullDate(form.birthday) && (
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  現在: 0000-00-00
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 連絡先情報セクション */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📞</span>
            連絡先情報
          </h2>
          <div className={styles.fieldGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>メールアドレス</label>
              <input
                className={styles.input}
                name="email"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
                placeholder="example@example.com"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>携帯番号</label>
              <input
                className={styles.input}
                name="mobile_phone"
                value={form.mobile_phone || ""}
                onChange={handleChange}
                placeholder="090-1234-5678"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>固定電話</label>
              <input
                className={styles.input}
                name="phone_number"
                value={form.phone_number || ""}
                onChange={handleChange}
                placeholder="03-1234-5678"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>郵便番号</label>
              <input
                className={styles.input}
                name="postcode"
                value={form.postcode || ""}
                onChange={handleChange}
                placeholder="123-4567"
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>市区町村</label>
              <input
                className={styles.input}
                name="city"
                value={form.city || ""}
                onChange={handleChange}
                placeholder="東京都新宿区"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>町域・番地</label>
              <input
                className={styles.input}
                name="block"
                value={form.block || ""}
                onChange={handleChange}
                placeholder="西新宿1-2-3"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>建物名</label>
              <input
                className={styles.input}
                name="building"
                value={form.building || ""}
                onChange={handleChange}
                placeholder="○○ビル 123号室"
              />
            </div>
          </div>
        </div>

        {/* 利用情報セクション */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏢</span>
            利用情報
          </h2>
          <div className={styles.fieldGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>受給者番号</label>
              <input
                className={styles.input}
                name="receiving_number"
                value={form.receiving_number || ""}
                onChange={handleChange}
                placeholder="受給者番号"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>作業場所</label>
              <select
                className={styles.input}
                name="work_place"
                value={String(form.work_place ?? "")}
                onChange={handleChange}
              >
                <option value="">選択してください</option>
                <option value="0">在宅</option>
                <option value="1">通所</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>利用状況</label>
              <select
                className={styles.input}
                name="usage_situation"
                value={String(form.usage_situation ?? "")}
                onChange={handleChange}
              >
                <option value="">選択してください</option>
                <option value="0">利用中</option>
                <option value="1">休止中</option>
                <option value="2">利用辞退</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>入所日</label>
              <DatePicker
                selected={getDisplayDate(form.start_date)}
                onChange={(date: Date | null) => {
                  setForm({
                    ...form,
                    start_date: date ? date.toISOString() : "",
                  });
                }}
                className={styles.input}
                dateFormat="yyyy-MM-dd"
                placeholderText="日付を選択"
              />
              {isNullDate(form.start_date) && (
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  現在: 0000-00-00
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>退所日</label>
              <DatePicker
                selected={getDisplayDate(form.end_date)}
                onChange={(date: Date | null) => {
                  setForm({
                    ...form,
                    end_date: date ? date.toISOString() : "",
                  });
                }}
                className={styles.input}
                dateFormat="yyyy-MM-dd"
                placeholderText="日付を選択"
              />
              {isNullDate(form.end_date) && (
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  現在: 0000-00-00
                </div>
              )}
            </div>
          </div>
        </div>

        {/* その他情報セクション */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📝</span>
            その他情報
          </h2>
          <div className={styles.fieldGrid}>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>備考</label>
              <textarea
                className={styles.textarea}
                name="remarks"
                value={form.remarks || ""}
                onChange={handleChange}
                placeholder="特記事項があれば記入してください"
                rows={3}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>人物像</label>
              <textarea
                className={styles.textarea}
                name="human_support"
                value={form.human_support || ""}
                onChange={handleChange}
                placeholder="サポートに必要な情報を記入してください"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* ボタンエリア */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={saving}
          >
            キャンセル
          </button>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? (
              <>
                <span className={styles.buttonSpinner}></span>
                保存中...
              </>
            ) : (
              "保存"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
