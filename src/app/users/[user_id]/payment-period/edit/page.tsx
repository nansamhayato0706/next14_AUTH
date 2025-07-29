"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../EditPaymentPeriodPage.module.css";

interface PaymentPeriod {
  id?: number;
  user_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

export default function EditPaymentPeriodPage() {
  const router = useRouter();
  const { user_id: userId } = useParams() as { user_id: string };

  const [paymentPeriod, setPaymentPeriod] = useState<PaymentPeriod>({
    user_id: parseInt(userId, 10),
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/users/${userId}/payment-period`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const record = Array.isArray(data) ? data[0] : data;
        if (record) {
          // APIがISO文字列含む場合、先頭10文字だけ取り出す
          setPaymentPeriod({
            ...record,
            start_date: record.start_date?.slice(0, 10) ?? "",
            end_date: record.end_date?.slice(0, 10) ?? "",
          });
        }
      } catch (e) {
        console.error(e);
        alert("支給期間の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = paymentPeriod.id ? "PUT" : "POST";
      const res = await fetch(`/api/users/${userId}/payment-period`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPeriod),
      });
      if (!res.ok) throw new Error();
      router.push(`/users/${userId}`);
    } catch {
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PaymentPeriod, val: string) => {
    setPaymentPeriod((prev) => ({ ...prev, [field]: val }));
  };

  // DatePicker 用に Date オブジェクトに変換。YYYY-MM-DD のみ扱うので問題なし
  const parseDate = (v: string) => {
    if (!v || v === "0000-00-00") return null;
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>支給期間編集</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 支給開始日 */}
        <div className={styles.field}>
          <label className={styles.label}>支給開始日</label>
          <DatePicker
            selected={parseDate(paymentPeriod.start_date)}
            onChange={(date) => {
              if (date) {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const dd = String(date.getDate()).padStart(2, "0");
                handleChange("start_date", `${yyyy}-${mm}-${dd}`);
              } else {
                handleChange("start_date", "");
              }
            }}
            className={styles.input}
            dateFormat="yyyy-MM-dd"
            placeholderText="日付を選択"
            isClearable
          />
        </div>

        {/* 支給終了日 */}
        <div className={styles.field}>
          <label className={styles.label}>支給終了日</label>
          <DatePicker
            selected={parseDate(paymentPeriod.end_date)}
            onChange={(date) => {
              if (date) {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const dd = String(date.getDate()).padStart(2, "0");
                handleChange("end_date", `${yyyy}-${mm}-${dd}`);
              } else {
                handleChange("end_date", "");
              }
            }}
            className={styles.input}
            dateFormat="yyyy-MM-dd"
            placeholderText="日付を選択"
            isClearable
          />
        </div>

        {/* ボタン */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => router.push(`/users/${userId}`)}
            disabled={saving}
          >
            キャンセル
          </button>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
