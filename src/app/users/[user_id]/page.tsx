// src/app/users/[user_id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toWareki } from "@/lib/utils/date";
import { UserRow } from "@/types/userTypes";
import styles from "@/app/users/[user_id]/EditUserPage.module.css";

/**
 * ユーザー詳細ページ（完全クライアント版）
 */
export default function UserDetailPage() {
  const { user_id } = useParams() as { user_id: string };
  const router = useRouter();

  const [user, setUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ───────────────────────────────
  // データ取得
  // ───────────────────────────────
  const fetchUser = async () => {
    try {
      setError("");
      const res = await fetch(`/api/users/${user_id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("not found");
      const data: UserRow = await res.json();
      setUser(data);
    } catch {
      setError("ユーザー情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [user_id]);

  // ───────────────────────────────
  // UI 状態分岐
  // ───────────────────────────────
  if (loading) return <p className={styles.loading}>読み込み中...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!user) return <p className={styles.error}>ユーザーが見つかりません</p>;

  // ───────────────────────────────
  // JSX 本体
  // ───────────────────────────────
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>ユーザー詳細</h1>

      <div className={styles.form}>
        {/* ───────────────── 基本情報 ───────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>👤</span>
            基本情報
          </h2>
          <div className={styles.fieldGrid}>
            <Field label="姓" value={user.last_name} />
            <Field label="名" value={user.first_name} />
            <Field label="姓フリガナ" value={user.last_name_kana} />
            <Field label="名フリガナ" value={user.first_name_kana} />
            <Field
              label="性別"
              value={
                user.sex === 1 ? "女性" : user.sex === 0 ? "男性" : "未選択"
              }
            />
            <Field
              label="誕生日"
              value={user.birthday ? toWareki(user.birthday) : "未設定"}
            />
            <Field label="受給者番号" value={user.receiving_number} />
          </div>
        </section>

        {/* ───────────────── 連絡先情報 ───────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📞</span>
            連絡先情報
          </h2>
          <div className={styles.fieldGrid}>
            <Field label="郵便番号" value={user.postcode} />
            <Field
              label="住所"
              value={`${user.city || ""}${user.block || ""}${
                user.building || ""
              }`}
            />
            <Field
              label="電話番号"
              value={user.mobile_phone || user.phone_number}
            />
            <Field label="e-mail" value={user.email} />
            <Field label="TeamViewer" value={user.tm} />
          </div>
        </section>

        {/* ───────────────── 利用情報 ───────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏢</span>
            利用情報
          </h2>
          <div className={styles.fieldGrid}>
            <Field label="入所日" value={toWareki(user.start_date)} />
            <Field label="退所日" value={toWareki(user.end_date)} />
            <Field
              label="作業場所"
              value={
                user.work_place === 0
                  ? "在宅"
                  : user.work_place === 1
                  ? "通所"
                  : "未設定"
              }
            />
            <Field
              label="利用状況"
              value={
                user.usage_situation === 0
                  ? "利用中"
                  : user.usage_situation === 1
                  ? "休止中"
                  : user.usage_situation === 2
                  ? "利用辞退"
                  : "未設定"
              }
            />
            <Field
              label="物件グループ"
              value={
                user.b_group_id === 1
                  ? "B型事業所"
                  : user.b_group_id === 2
                  ? "一般作業者"
                  : "未選択"
              }
            />
            <Field
              label="作業者種別"
              value={
                user.user_type_id === 1
                  ? "利用者"
                  : user.user_type_id === 2
                  ? "一般作業者"
                  : user.user_type_id === 3
                  ? "事業所"
                  : user.user_type_id === 4
                  ? "移行支援事業所"
                  : "未設定"
              }
            />
          </div>
        </section>

        {/* ───────────────── 期間・料金情報 ───────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💰</span>
            期間・料金情報
          </h2>
          <div className={styles.fieldGrid}>
            {/* 支給期間 */}
            <SubSection
              title="支給期間"
              editHref={`/users/${user.user_id}/payment-period/edit`}
            >
              <Field
                label="支給開始日"
                value={toWareki(user.payment_start_date)}
              />
              <Field
                label="支給終了日"
                value={toWareki(user.payment_end_date)}
              />
            </SubSection>

            {/* 利用料期間 */}
            <SubSection
              title="利用料期間"
              editHref={`/users/${user.user_id}/usage-fee/edit`}
            >
              <Field
                label="利用料開始日"
                value={toWareki(user.usage_start_date)}
              />
              <Field
                label="利用料終了日"
                value={toWareki(user.usage_end_date)}
              />
            </SubSection>

            <Field
              label="利用料"
              value={
                user.usage_fee === 1
                  ? "あり"
                  : user.usage_fee === 0
                  ? "なし"
                  : "未設定"
              }
            />
            <Field
              label="自治体助成負担"
              value={
                user.subsidy === 1
                  ? "あり"
                  : user.subsidy === 0
                  ? "なし"
                  : "未設定"
              }
            />
            <Field label="口座番号" value={user.account_number} />
          </div>
        </section>

        {/* ───────────────── サポート事業所 ───────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏛️</span>
            サポート事業所情報
          </h2>
          <div className={styles.fieldGrid}>
            <Field label="事業所名" value={user.support_office} />
            <Field label="担当者名" value={user.support_personnel} />
            <Field label="電話番号" value={user.support_phone} />
          </div>
        </section>

        {/* ───────────────── 障がい情報 ───────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🆔</span>
            障がい情報
          </h2>
          <div className={styles.fieldGrid}>
            <Field label="障がい名等" value={user.handicap_name} />
            <Field
              label="障がい区分"
              value={
                user.classification === 0
                  ? "なし"
                  : user.classification === 1
                  ? "区分1"
                  : user.classification === 2
                  ? "区分2"
                  : user.classification === 3
                  ? "区分3"
                  : user.classification === 4
                  ? "区分4"
                  : user.classification === 5
                  ? "区分5"
                  : user.classification === 6
                  ? "区分6"
                  : "未設定"
              }
            />
            <Field
              label="障がい種別"
              value={
                user.handicap_class === 0
                  ? "精神障がい"
                  : user.handicap_class === 1
                  ? "身体障がい"
                  : user.handicap_class === 2
                  ? "知的障がい"
                  : user.handicap_class === 3
                  ? "自立支援"
                  : "未設定"
              }
            />
            <Field label="障がい者手帳番号" value={user.handicap_number} />
            <Field
              label="等級"
              value={
                user.handicap_grade === 1
                  ? "１級"
                  : user.handicap_grade === 2
                  ? "２級"
                  : user.handicap_grade === 3
                  ? "３級"
                  : user.handicap_grade === 4
                  ? "４級"
                  : user.handicap_grade === 5
                  ? "５級"
                  : user.handicap_grade === 6
                  ? "６級"
                  : "未選択"
              }
            />
          </div>
        </section>

        {/* ───────────────── その他情報 ───────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📝</span>
            その他情報
          </h2>
          <div className={styles.fieldGrid}>
            <Field label="備考" value={user.remarks} />
            <Field label="人物像" value={user.human_support} />
          </div>
        </section>
      </div>

      {/* ───────── アクションボタン ───────── */}
      <div className={styles.actionButtons}>
        <button
          className={styles.cancelButton}
          onClick={() => router.push("/")}
        >
          一覧へ戻る
        </button>

        <button
          className={styles.primaryButton}
          onClick={() => router.push(`/users/${user.user_id}/edit`)}
        >
          編集する
        </button>
      </div>
    </main>
  );
}

/*------------------------------------------
  再利用コンポーネント
------------------------------------------*/
type FieldProps = { label: string; value?: string | number | null };
const Field = ({ label, value }: FieldProps) => (
  <div className={styles.field}>
    <div className={styles.label}>{label}:</div>
    <div className={styles.value}>{value ?? ""}</div>
  </div>
);

type SubSectionProps = {
  title: string;
  editHref: string;
  children: React.ReactNode;
};
const SubSection = ({ title, editHref, children }: SubSectionProps) => (
  <div className={styles.subSection}>
    <div className={styles.subSectionHeader}>
      <h3 className={styles.subSectionTitle}>{title}</h3>
      <Link href={editHref} className={styles.editButton}>
        <span className={styles.editIcon}>✏️</span>
        編集
      </Link>
    </div>
    <div className={styles.subSectionContent}>{children}</div>
  </div>
);
