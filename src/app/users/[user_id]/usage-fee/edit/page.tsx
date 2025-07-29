"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../EditPaymentPeriodPage.module.css";

interface UsageFee {
  id?: number;
  user_id: number;
  start_date: string;
  end_date: string;
  monthly_fee: number;
}

export default function EditUsageFeePage() {
  const router = useRouter();
  const { user_id: userId } = useParams() as { user_id: string };

  const [usageFee, setUsageFee] = useState<UsageFee>({
    user_id: parseInt(userId),
    start_date: "",
    end_date: "",
    monthly_fee: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsageFee();
  }, [userId]);

  const fetchUsageFee = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/usage-fee`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      // 配列で返ってきたら先頭要素を使う
      const record = Array.isArray(data) ? data[0] : data;
      if (record) {
        setUsageFee(record);
      }
    } catch (error) {
      console.error("利用料金の取得に失敗しました:", error);
      alert("利用料金の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = usageFee.id ? "PUT" : "POST";
      const res = await fetch(`/api/users/${userId}/usage-fee`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usageFee),
      });
      if (!res.ok) throw new Error();
      alert("利用料金が正常に保存されました");
      router.push(`/users/${userId}`);
    } catch {
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UsageFee, value: string | number) => {
    setUsageFee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const parseDate = (v: string) =>
    !v || v.startsWith("1899") || v === "0000-00-00" ? null : new Date(v);

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>利用料金編集</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 利用開始日 */}
        <div className={styles.field}>
          <label className={styles.label}>利用開始日</label>
          <DatePicker
            selected={parseDate(usageFee.start_date)}
            onChange={(date) =>
              handleChange("start_date", date ? date.toISOString() : "")
            }
            className={styles.input}
            dateFormat="yyyy-MM-dd"
            placeholderText="日付を選択"
          />
        </div>

        {/* 利用終了日 */}
        <div className={styles.field}>
          <label className={styles.label}>利用終了日</label>
          <DatePicker
            selected={parseDate(usageFee.end_date)}
            onChange={(date) =>
              handleChange("end_date", date ? date.toISOString() : "")
            }
            className={styles.input}
            dateFormat="yyyy-MM-dd"
            placeholderText="日付を選択"
          />
        </div>

        {/* 月額料金 */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="monthly_fee">
            月額料金
          </label>
          <input
            id="monthly_fee"
            type="number"
            min="0"
            required
            className={styles.input}
            value={usageFee.monthly_fee}
            onChange={(e) =>
              handleChange("monthly_fee", parseInt(e.target.value) || 0)
            }
          />
          <span className={styles.unit}>円</span>
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
