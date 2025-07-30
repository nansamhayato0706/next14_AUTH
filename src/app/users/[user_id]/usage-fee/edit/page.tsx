"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import { toWareki } from "@/lib/utils/date";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/app/users/[user_id]/EditPeriodPage.module.css";

interface UsageFee {
  id?: number;
  user_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  monthly_fee: number;
  created_at?: string;
  updated_at?: string;
}

export default function UsageFeeManagementPage() {
  const router = useRouter();
  const { user_id: userId } = useParams() as { user_id: string };

  const [usageFees, setUsageFees] = useState<UsageFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);

  // 新規追加用の初期データ
  const getNewUsageFee = (): UsageFee => ({
    user_id: parseInt(userId, 10),
    start_date: "",
    end_date: "",
    monthly_fee: 0,
  });

  const [newUsageFee, setNewUsageFee] = useState<UsageFee>(getNewUsageFee());

  useEffect(() => {
    fetchUsageFees();
  }, [userId]);

  const fetchUsageFees = async () => {
    try {
      setError("");
      const res = await fetch(`/api/users/${userId}/usage-fee`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "利用料金の取得に失敗しました");
      }

      const data = await res.json();
      const fees = Array.isArray(data) ? data : [data].filter(Boolean);

      // 日付フォーマットを統一
      const formattedFees = fees.map((fee) => ({
        ...fee,
        start_date: fee.start_date?.slice(0, 10) ?? "",
        end_date: fee.end_date?.slice(0, 10) ?? "",
      }));

      setUsageFees(formattedFees);
    } catch (e) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "利用料金の取得に失敗しました";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (usageFee: UsageFee) => {
    // クライアントサイドバリデーション
    if (!usageFee.start_date || !usageFee.end_date) {
      setError("開始日と終了日を入力してください");
      return;
    }

    if (usageFee.monthly_fee < 0) {
      setError("月額料金は0以上である必要があります");
      return;
    }

    const startDate = new Date(usageFee.start_date);
    const endDate = new Date(usageFee.end_date);

    if (startDate >= endDate) {
      setError("開始日は終了日より前である必要があります");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const method = usageFee.id ? "PUT" : "POST";
      const res = await fetch(`/api/users/${userId}/usage-fee`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usageFee),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "保存に失敗しました");
      }

      const result = await res.json();
      console.log("保存成功:", result);

      // データを再取得
      await fetchUsageFees();

      // 編集モードを解除
      setEditingId(null);
      setShowAddForm(false);
      setNewUsageFee(getNewUsageFee());
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
    if (!confirm("この利用料金を削除しますか？")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/users/${userId}/usage-fee?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "削除に失敗しました");
      }

      // データを再取得
      await fetchUsageFees();
    } catch (e) {
      console.error("削除エラー:", e);
      const errorMessage =
        e instanceof Error ? e.message : "削除に失敗しました";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleUsageFeeChange = (
    fees: UsageFee[],
    index: number,
    field: keyof UsageFee,
    value: string | number
  ) => {
    const updated = [...fees];
    updated[index] = { ...updated[index], [field]: value };
    setUsageFees(updated);
    if (error) setError("");
  };

  const handleNewUsageFeeChange = (
    field: keyof UsageFee,
    value: string | number
  ) => {
    setNewUsageFee((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  // DatePicker 用に Date オブジェクトに変換
  const parseDate = (v: string) => {
    if (!v || v === "0000-00-00" || v.startsWith("1899")) return null;
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
        <h1 className={styles.title}>利用料管理</h1>
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
          <h3>新規利用料金追加</h3>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>
                利用開始日 <span className={styles.required}>*</span>
              </label>
              <DatePicker
                selected={parseDate(newUsageFee.start_date)}
                onChange={(date) => {
                  handleNewUsageFeeChange(
                    "start_date",
                    formatDateForInput(date)
                  );
                }}
                className={styles.input}
                dateFormat="yyyy-MM-dd"
                placeholderText="日付を選択"
                maxDate={
                  newUsageFee.end_date
                    ? new Date(newUsageFee.end_date)
                    : undefined
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                利用終了日 <span className={styles.required}>*</span>
              </label>
              <DatePicker
                selected={parseDate(newUsageFee.end_date)}
                onChange={(date) => {
                  handleNewUsageFeeChange("end_date", formatDateForInput(date));
                }}
                className={styles.input}
                dateFormat="yyyy-MM-dd"
                placeholderText="日付を選択"
                minDate={
                  newUsageFee.start_date
                    ? new Date(newUsageFee.start_date)
                    : undefined
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="new_monthly_fee">
                月額料金 <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWithUnit}>
                <input
                  id="new_monthly_fee"
                  type="number"
                  min="0"
                  required
                  className={styles.input}
                  value={newUsageFee.monthly_fee}
                  onChange={(e) =>
                    handleNewUsageFeeChange(
                      "monthly_fee",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
                <span className={styles.unit}>円</span>
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setShowAddForm(false);
                  setNewUsageFee(getNewUsageFee());
                  setError("");
                }}
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                type="button"
                className={styles.saveButton}
                onClick={() => handleSave(newUsageFee)}
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
        {usageFees.length === 0 ? (
          <div className={styles.noData}>利用料金が登録されていません</div>
        ) : (
          usageFees.map((usageFee, index) => (
            <div key={usageFee.id} className={styles.periodItem}>
              {editingId === usageFee.id ? (
                // 編集モード
                <div className={styles.editMode}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        利用開始日 <span className={styles.required}>*</span>
                      </label>
                      <DatePicker
                        selected={parseDate(usageFee.start_date)}
                        onChange={(date) => {
                          handleUsageFeeChange(
                            usageFees,
                            index,
                            "start_date",
                            formatDateForInput(date)
                          );
                        }}
                        className={styles.input}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="日付を選択"
                        maxDate={
                          usageFee.end_date
                            ? new Date(usageFee.end_date)
                            : undefined
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        利用終了日 <span className={styles.required}>*</span>
                      </label>
                      <DatePicker
                        selected={parseDate(usageFee.end_date)}
                        onChange={(date) => {
                          handleUsageFeeChange(
                            usageFees,
                            index,
                            "end_date",
                            formatDateForInput(date)
                          );
                        }}
                        className={styles.input}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="日付を選択"
                        minDate={
                          usageFee.start_date
                            ? new Date(usageFee.start_date)
                            : undefined
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label
                        className={styles.label}
                        htmlFor={`monthly_fee_${usageFee.id}`}
                      >
                        月額料金 <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.inputWithUnit}>
                        <input
                          id={`monthly_fee_${usageFee.id}`}
                          type="number"
                          min="0"
                          required
                          className={styles.input}
                          value={usageFee.monthly_fee}
                          onChange={(e) =>
                            handleUsageFeeChange(
                              usageFees,
                              index,
                              "monthly_fee",
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                        <span className={styles.unit}>円</span>
                      </div>
                    </div>
                    <div className={styles.buttonGroup}>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => {
                          setEditingId(null);
                          fetchUsageFees(); // 元のデータに戻す
                          setError("");
                        }}
                        disabled={saving}
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        className={styles.saveButton}
                        onClick={() => handleSave(usageFee)}
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
                    <span className={styles.dateRange}>
                      {toWareki(usageFee.start_date!)} ～{" "}
                      {toWareki(usageFee.end_date!)}
                    </span>
                    <span className={styles.monthlyFee}>
                      利用料: {usageFee.monthly_fee.toLocaleString()}円
                    </span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => setEditingId(usageFee.id!)}
                      disabled={saving || editingId !== null || showAddForm}
                    >
                      編集
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(usageFee.id!)}
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
