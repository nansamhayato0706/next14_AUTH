"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import { toWareki } from "@/lib/utils/date";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/app/users/[user_id]/EditPeriodPage.module.css";

interface PaymentPeriod {
  id?: number;
  user_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
}

export default function PaymentPeriodManagementPage() {
  const router = useRouter();
  const { user_id: userId } = useParams() as { user_id: string };

  const [paymentPeriods, setPaymentPeriods] = useState<PaymentPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);

  // 新規追加用の初期データ
  const getNewPeriod = (): PaymentPeriod => ({
    user_id: parseInt(userId, 10),
    start_date: "",
    end_date: "",
  });

  const [newPeriod, setNewPeriod] = useState<PaymentPeriod>(getNewPeriod());

  useEffect(() => {
    fetchPaymentPeriods();
  }, [userId]);

  const fetchPaymentPeriods = async () => {
    try {
      setError("");
      const res = await fetch(`/api/users/${userId}/payment-period`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "支給期間の取得に失敗しました");
      }

      const data = await res.json();
      const periods = Array.isArray(data) ? data : [data].filter(Boolean);

      // 日付フォーマットを統一
      const formattedPeriods = periods.map((period) => ({
        ...period,
        start_date: period.start_date?.slice(0, 10) ?? "",
        end_date: period.end_date?.slice(0, 10) ?? "",
      }));

      setPaymentPeriods(formattedPeriods);
    } catch (e) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "支給期間の取得に失敗しました";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (period: PaymentPeriod) => {
    // クライアントサイドバリデーション
    if (!period.start_date || !period.end_date) {
      setError("開始日と終了日を入力してください");
      return;
    }

    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);

    if (startDate >= endDate) {
      setError("開始日は終了日より前である必要があります");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const method = period.id ? "PUT" : "POST";
      const res = await fetch(`/api/users/${userId}/payment-period`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(period),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "保存に失敗しました");
      }

      const result = await res.json();
      console.log("保存成功:", result);

      // データを再取得
      await fetchPaymentPeriods();

      // 編集モードを解除
      setEditingId(null);
      setShowAddForm(false);
      setNewPeriod(getNewPeriod());
    } catch (e) {
      console.error("保存エラー:", e);
      const errorMessage =
        e instanceof Error ? e.message : "保存に失敗しました";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この支給期間を削除しますか？")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/users/${userId}/payment-period?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "削除に失敗しました");
      }

      // データを再取得
      await fetchPaymentPeriods();
    } catch (e) {
      console.error("削除エラー:", e);
      const errorMessage =
        e instanceof Error ? e.message : "削除に失敗しました";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePeriodChange = (
    periods: PaymentPeriod[],
    index: number,
    field: keyof PaymentPeriod,
    value: string
  ) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    setPaymentPeriods(updated);
    if (error) setError("");
  };

  const handleNewPeriodChange = (field: keyof PaymentPeriod, value: string) => {
    setNewPeriod((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  // DatePicker 用に Date オブジェクトに変換
  const parseDate = (v: string) => {
    if (!v || v === "0000-00-00") return null;
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>支給期間管理</h1>
        <button
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
          disabled={saving || showAddForm}
        >
          新規追加
        </button>
      </div>

      {/* エラーメッセージ表示 */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* 新規追加フォーム */}
      {showAddForm && (
        <div className={styles.addForm}>
          <h3>新規支給期間追加</h3>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>
                支給開始日 <span className={styles.required}>*</span>
              </label>
              <DatePicker
                selected={parseDate(newPeriod.start_date)}
                onChange={(date) => {
                  handleNewPeriodChange("start_date", formatDateForInput(date));
                }}
                className={styles.input}
                dateFormat="yyyy-MM-dd"
                placeholderText="日付を選択"
                maxDate={
                  newPeriod.end_date ? new Date(newPeriod.end_date) : undefined
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                支給終了日 <span className={styles.required}>*</span>
              </label>
              <DatePicker
                selected={parseDate(newPeriod.end_date)}
                onChange={(date) => {
                  handleNewPeriodChange("end_date", formatDateForInput(date));
                }}
                className={styles.input}
                dateFormat="yyyy-MM-dd"
                placeholderText="日付を選択"
                minDate={
                  newPeriod.start_date
                    ? new Date(newPeriod.start_date)
                    : undefined
                }
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setShowAddForm(false);
                  setNewPeriod(getNewPeriod());
                  setError("");
                }}
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                type="button"
                className={styles.saveButton}
                onClick={() => handleSave(newPeriod)}
                disabled={saving}
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 既存データリスト */}
      <div className={styles.periodList}>
        {paymentPeriods.length === 0 ? (
          <div className={styles.noData}>支給期間が登録されていません</div>
        ) : (
          paymentPeriods.map((period, index) => (
            <div key={period.id} className={styles.periodItem}>
              {editingId === period.id ? (
                // 編集モード
                <div className={styles.editMode}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        支給開始日 <span className={styles.required}>*</span>
                      </label>
                      <DatePicker
                        selected={parseDate(period.start_date)}
                        onChange={(date) => {
                          handlePeriodChange(
                            paymentPeriods,
                            index,
                            "start_date",
                            formatDateForInput(date)
                          );
                        }}
                        className={styles.input}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="日付を選択"
                        maxDate={
                          period.end_date
                            ? new Date(period.end_date)
                            : undefined
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        支給終了日 <span className={styles.required}>*</span>
                      </label>
                      <DatePicker
                        selected={parseDate(period.end_date)}
                        onChange={(date) => {
                          handlePeriodChange(
                            paymentPeriods,
                            index,
                            "end_date",
                            formatDateForInput(date)
                          );
                        }}
                        className={styles.input}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="日付を選択"
                        minDate={
                          period.start_date
                            ? new Date(period.start_date)
                            : undefined
                        }
                      />
                    </div>
                    <div className={styles.buttonGroup}>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => {
                          setEditingId(null);
                          fetchPaymentPeriods(); // 元のデータに戻す
                          setError("");
                        }}
                        disabled={saving}
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        className={styles.saveButton}
                        onClick={() => handleSave(period)}
                        disabled={saving}
                      >
                        {saving ? "保存中..." : "保存"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div className={styles.viewMode}>
                  <div className={styles.periodInfo}>
                    {" "}
                    <span className={styles.dateRange}>
                      {toWareki(period.start_date!)} ～{" "}
                      {toWareki(period.end_date)!}{" "}
                    </span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => setEditingId(period.id!)}
                      disabled={saving || editingId !== null || showAddForm}
                    >
                      編集
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(period.id!)}
                      disabled={saving || editingId !== null || showAddForm}
                    >
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 戻るボタン */}
      <div className={styles.backButton}>
        <button
          className={styles.cancelButton}
          onClick={() => router.push(`/users/${userId}`)}
          disabled={saving}
        >
          戻る
        </button>
      </div>
    </div>
  );
}
