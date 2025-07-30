// src/app/users/[user_id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import { parseISO, isValid, format as fmt } from "date-fns";
import { UserRow } from "@/types/userTypes";
import styles from "@/app/users/[user_id]/EditUserPage.module.css";
import "react-datepicker/dist/react-datepicker.css";

/*──────────────────────────
  共通ヘルパー
──────────────────────────*/
const NULL_DATES = ["0000-00-00", "1899-11-29", "1899-11-30"];
const isNullDate = (v?: string | null) =>
  v ? NULL_DATES.some((d) => v.startsWith(d)) : false;

const toDate = (v?: string | null): Date | null => {
  if (!v || isNullDate(v)) return null;
  const d = v.length > 10 ? parseISO(v) : new Date(v);
  return isValid(d) ? d : null;
};

/*──────────────────────────
  React コンポーネント
──────────────────────────*/
export default function EditUserPage() {
  const router = useRouter();
  const { user_id } = useParams() as { user_id: string };

  const [form, setForm] = useState<Partial<UserRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* 取得 */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${user_id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("ユーザー情報取得失敗");
        setForm(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user_id]);

  /* 汎用入力チェンジ */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => form && setForm({ ...form, [e.target.name]: e.target.value });

  /* 保存 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("更新に失敗しました");
      router.push(`/users/${user_id}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.loading}>読み込み中...</p>;
  if (error || !form) return <p className={styles.error}>{error}</p>;

  /*──────────── JSX ────────────*/
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>ユーザー情報編集</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* ───────── 基本情報 ───────── */}
        <Section icon="👤" title="基本情報">
          <Grid>
            <Field label="姓" required>
              <input
                name="last_name"
                value={form.last_name || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="名" required>
              <input
                name="first_name"
                value={form.first_name || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="姓フリガナ">
              <input
                name="last_name_kana"
                value={form.last_name_kana || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="名フリガナ">
              <input
                name="first_name_kana"
                value={form.first_name_kana || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="性別">
              <select
                name="sex"
                value={form.sex ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未選択</option>
                <option value="0">男性</option>
                <option value="1">女性</option>
              </select>
            </Field>
            <Field label="誕生日">
              <div className={styles.datePickerWrapper}>
                <DatePicker
                  selected={toDate(form.birthday)}
                  onChange={(d) =>
                    setForm({
                      ...form,
                      birthday: d ? fmt(d, "yyyy-MM-dd") : "",
                    })
                  }
                  className={styles.input}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="日付を選択"
                />
              </div>
              {isNullDate(form.birthday) && (
                <span className={styles.hint}>現在: 0000-00-00</span>
              )}
            </Field>
          </Grid>
        </Section>

        {/* ───────── 連絡先情報 ───────── */}
        <Section icon="📞" title="連絡先情報">
          <Grid>
            <Field label="メールアドレス">
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="携帯番号">
              <input
                name="mobile_phone"
                value={form.mobile_phone || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="固定電話">
              <input
                name="phone_number"
                value={form.phone_number || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="郵便番号">
              <input
                name="postcode"
                value={form.postcode || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="市区町村" full>
              <input
                name="city"
                value={form.city || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="町域・番地">
              <input
                name="block"
                value={form.block || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="建物名">
              <input
                name="building"
                value={form.building || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
          </Grid>
        </Section>

        {/* ───────── 利用情報 ───────── */}
        <Section icon="🏢" title="利用情報">
          <Grid>
            <Field label="受給者番号">
              <input
                name="receiving_number"
                value={form.receiving_number || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="作業場所">
              <select
                name="work_place"
                value={form.work_place ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未選択</option>
                <option value="0">在宅</option>
                <option value="1">通所</option>
              </select>
            </Field>
            <Field label="利用状況">
              <select
                name="usage_situation"
                value={form.usage_situation ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未選択</option>
                <option value="0">利用中</option>
                <option value="1">休止中</option>
                <option value="2">利用辞退</option>
              </select>
            </Field>
            <Field label="入所日">
              <div className={styles.datePickerWrapper}>
                <DatePicker
                  selected={toDate(form.start_date)}
                  onChange={(d) =>
                    setForm({
                      ...form,
                      start_date: d ? fmt(d, "yyyy-MM-dd") : "",
                    })
                  }
                  className={styles.input}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="日付"
                />
              </div>
              {isNullDate(form.start_date) && (
                <span className={styles.hint}>現在: 0000-00-00</span>
              )}
            </Field>

            <Field label="退所日">
              <div className={styles.datePickerWrapper}>
                <DatePicker
                  selected={toDate(form.end_date)}
                  onChange={(d) =>
                    setForm({
                      ...form,
                      end_date: d ? fmt(d, "yyyy-MM-dd") : "",
                    })
                  }
                  className={styles.input}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="日付"
                />
              </div>
              {isNullDate(form.end_date) && (
                <span className={styles.hint}>現在: 0000-00-00</span>
              )}
            </Field>
            <Field label="物件グループ">
              <select
                name="b_group_id"
                value={form.b_group_id ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未選択</option>
                <option value="1">B型事業所</option>
                <option value="2">一般作業者</option>
              </select>
            </Field>
            <Field label="作業者種別">
              <select
                name="user_type_id"
                value={form.user_type_id ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未選択</option>
                <option value="1">利用者</option>
                <option value="2">一般作業者</option>
                <option value="3">事業所</option>
                <option value="4">移行支援事業所</option>
              </select>
            </Field>
            <Field label="利用料有無">
              <select
                name="usage_fee"
                value={form.usage_fee ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未設定</option>
                <option value="1">あり</option>
                <option value="0">なし</option>
              </select>
            </Field>
            <Field label="自治体助成負担">
              <select
                name="subsidy"
                value={form.subsidy ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未設定</option>
                <option value="1">あり</option>
                <option value="0">なし</option>
              </select>
            </Field>
            <Field label="口座番号">
              <input
                name="account_number"
                value={form.account_number || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
          </Grid>
        </Section>

        {/* ───────── サポート事業所 ───────── */}
        <Section icon="🏛️" title="サポート事業所情報">
          <Grid>
            <Field label="事業所名">
              <input
                name="support_office"
                value={form.support_office || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="担当者名">
              <input
                name="support_personnel"
                value={form.support_personnel || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="電話番号">
              <input
                name="support_phone"
                value={form.support_phone || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
          </Grid>
        </Section>

        {/* ───────── 障がい情報 ───────── */}
        <Section icon="🆔" title="障がい情報">
          <Grid>
            <Field label="障がい名等" full>
              <input
                name="handicap_name"
                value={form.handicap_name || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="障がい区分">
              <select
                name="classification"
                value={form.classification ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未設定</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option value={n} key={n}>
                    区分{n}
                  </option>
                ))}
                <option value="0">なし</option>
              </select>
            </Field>
            <Field label="障がい種別">
              <select
                name="handicap_class"
                value={form.handicap_class ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未設定</option>
                <option value="0">精神障がい</option>
                <option value="1">身体障がい</option>
                <option value="2">知的障がい</option>
                <option value="3">自立支援</option>
              </select>
            </Field>
            <Field label="手帳番号">
              <input
                name="handicap_number"
                value={form.handicap_number || ""}
                onChange={handleChange}
                className={styles.input}
              />
            </Field>
            <Field label="等級">
              <select
                name="handicap_grade"
                value={form.handicap_grade ?? ""}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">未選択</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option value={n} key={n}>
                    {n}級
                  </option>
                ))}
              </select>
            </Field>
          </Grid>
        </Section>

        {/* ───────── その他情報 ───────── */}
        <Section icon="📝" title="その他情報">
          <Grid>
            <Field label="備考" full>
              <textarea
                name="remarks"
                value={form.remarks || ""}
                onChange={handleChange}
                rows={3}
                className={styles.textarea}
              />
            </Field>
            <Field label="人物像" full>
              <textarea
                name="human_support"
                value={form.human_support || ""}
                onChange={handleChange}
                rows={3}
                className={styles.textarea}
              />
            </Field>
          </Grid>
        </Section>

        {/* ───────── ボタン ───────── */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => router.push(`/users/${user_id}`)}
            disabled={saving}
          >
            キャンセル
          </button>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </main>
  );
}

/*──────────────────────────
  小コンポーネント
──────────────────────────*/
const Section: React.FC<{
  icon: string;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>
      <span className={styles.sectionIcon}>{icon}</span>
      {title}
    </h2>
    {children}
  </section>
);

const Grid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.fieldGrid}>{children}</div>
);

const Field: React.FC<{
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}> = ({ label, required, full, children }) => (
  <div className={`${styles.fieldGroup} ${full ? styles.fullWidth : ""}`}>
    <label className={styles.label}>
      {label}
      {required && <span className={styles.required}> *</span>}
    </label>
    {children}
  </div>
);
