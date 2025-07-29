import { notFound } from "next/navigation";
import Link from "next/link";
import { pool } from "@/lib/db";
import { toWareki } from "@/lib/utils/date";
import { UserRow } from "@/types/userTypes";
import styles from "@/app/users/[user_id]/EditUserPage.module.css";

// DBからユーザー1件を取得する関数
async function getUser(user_id: string): Promise<UserRow | null> {
  const [rows] = await pool.query(
    `
    SELECT
      u.*, 
      uf.start_date AS usage_start_date,
      uf.end_date AS usage_end_date,
      pp.start_date AS payment_start_date,
      pp.end_date AS payment_end_date
    FROM users u
    LEFT JOIN usage_fee uf
      ON uf.user_id = u.user_id
      AND uf.id = (
        SELECT MAX(id) FROM usage_fee WHERE user_id = u.user_id
      )
    LEFT JOIN payment_period pp
      ON pp.user_id = u.user_id
      AND pp.id = (
        SELECT MAX(id) FROM payment_period WHERE user_id = u.user_id
      )
    WHERE u.user_id = ?
    `,
    [user_id]
  );

  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0] as UserRow;
}

type PageProps = {
  params: {
    user_id: string;
  };
};

export default async function UserDetailPage({ params }: PageProps) {
  const user = await getUser(params.user_id);
  if (!user) return notFound();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>ユーザー詳細</h1>
      <div className={styles.form}>
        {/* 基本情報セクション */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>👤</span>
            基本情報
          </h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <div className={styles.label}>姓:</div>
              <div className={styles.value}>{user.last_name || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>名:</div>
              <div className={styles.value}>{user.first_name || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>姓フリガナ:</div>
              <div className={styles.value}>{user.last_name_kana || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>名フリガナ:</div>
              <div className={styles.value}>{user.first_name_kana || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>性別:</div>
              <div className={styles.value}>
                {user.sex === 1 ? "女性" : user.sex === 0 ? "男性" : "未選択"}
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>誕生日:</div>
              <div className={styles.value}>
                {user.birthday ? toWareki(user.birthday) : "未設定"}
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>受給者番号:</div>
              <div className={styles.value}>{user.receiving_number || ""}</div>
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
            <div className={styles.field}>
              <div className={styles.label}>郵便番号:</div>
              <div className={styles.value}>{user.postcode || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>住所:</div>
              <div className={styles.value}>
                {`${user.city || ""}${user.block || ""}${user.building || ""}`}
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>電話番号:</div>
              <div className={styles.value}>
                {user.mobile_phone || user.phone_number || ""}
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>e-mail:</div>
              <div className={styles.value}>{user.email || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>TeamViewer:</div>
              <div className={styles.value}>{user.tm || ""}</div>
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
            <div className={styles.field}>
              <div className={styles.label}>入所日:</div>
              <div className={styles.value}>
                {toWareki(user.start_date) || ""}
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>退所日:</div>
              <div className={styles.value}>
                {toWareki(user.end_date) || ""}
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>作業場所:</div>
              <div className={styles.value}>
                {user.work_place === 0
                  ? "在宅"
                  : user.work_place === 1
                  ? "通所"
                  : "未設定"}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>利用状況:</div>
              <div className={styles.value}>
                {user.usage_situation === 0
                  ? "利用中"
                  : user.usage_situation === 1
                  ? "休止中"
                  : user.usage_situation === 2
                  ? "利用辞退"
                  : "未設定"}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>物件グループ:</div>
              <div className={styles.value}>
                {user.b_group_id === 1
                  ? "B型事業所"
                  : user.b_group_id === 2
                  ? "一般作業者"
                  : "未選択"}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>作業者種別:</div>
              <div className={styles.value}>
                {user.user_type_id === 1
                  ? "利用者"
                  : user.user_type_id === 2
                  ? "一般作業者"
                  : user.user_type_id === 3
                  ? "事業所"
                  : user.user_type_id === 4
                  ? "移行支援事業所"
                  : "未設定"}
              </div>
            </div>
          </div>
        </div>

        {/* 期間・料金情報セクション */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💰</span>
            期間・料金情報
          </h2>
          <div className={styles.fieldGrid}>
            {/* 利用期間セクション */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>利用期間</h3>
                <Link
                  href={`/users/${user.user_id}/usage-fee/edit`}
                  className={styles.editLink}
                >
                  編集
                </Link>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>利用開始日:</div>
                <div className={styles.value}>
                  {toWareki(user.usage_start_date) || ""}
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>利用終了日:</div>
                <div className={styles.value}>
                  {toWareki(user.usage_end_date) || ""}
                </div>
              </div>
            </div>

            {/* 支給期間セクション */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>支給期間</h3>
                <Link
                  href={`/users/${user.user_id}/payment-period/edit`}
                  className={styles.editLink}
                >
                  編集
                </Link>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>支給開始日:</div>
                <div className={styles.value}>
                  {toWareki(user.payment_start_date) || ""}
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>支給終了日:</div>
                <div className={styles.value}>
                  {toWareki(user.payment_end_date) || ""}
                </div>
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>利用料:</div>
              <div className={styles.value}>
                {user.usage_fee === 1
                  ? "あり"
                  : user.usage_fee === 0
                  ? "なし"
                  : "未設定"}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>自治体助成負担:</div>
              <div className={styles.value}>
                {user.subsidy === 1
                  ? "あり"
                  : user.subsidy === 0
                  ? "なし"
                  : "未設定"}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>口座番号:</div>
              <div className={styles.value}>{user.account_number || ""}</div>
            </div>
          </div>
        </div>

        {/* サポート事業所情報セクション */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏛️</span>
            サポート事業所情報
          </h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <div className={styles.label}>事業所名:</div>
              <div className={styles.value}>{user.support_office || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>担当者名:</div>
              <div className={styles.value}>{user.support_personnel || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>電話番号:</div>
              <div className={styles.value}>{user.support_phone || ""}</div>
            </div>
          </div>
        </div>

        {/* 障がい情報セクション */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🆔</span>
            障がい情報
          </h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <div className={styles.label}>障がい名等:</div>
              <div className={styles.value}>{user.handicap_name || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>障がい区分:</div>
              <div className={styles.value}>
                {user.classification === 0
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
                  : "未設定"}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>障がい種別:</div>
              <div className={styles.value}>
                {user.handicap_class === 0
                  ? "精神障がい"
                  : user.handicap_class === 1
                  ? "身体障がい"
                  : user.handicap_class === 2
                  ? "知的障がい"
                  : user.handicap_class === 3
                  ? "自立支援"
                  : "未設定"}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>障がい者手帳番号:</div>
              <div className={styles.value}>{user.handicap_number || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>障がい区分:</div>
              <div className={styles.value}>
                {user.classification === 0
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
                  : "未設定"}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>等級:</div>
              <div className={styles.value}>
                {user.handicap_grade === 1
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
                  : "未選択"}
              </div>
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
            <div className={styles.field}>
              <div className={styles.label}>備考:</div>
              <div className={styles.value}>{user.remarks || ""}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.label}>人物像:</div>
              <div className={styles.value}>{user.human_support || ""}</div>
            </div>
          </div>
        </div>
      </div>

      <a href={`/users/${user.user_id}/edit`} className={styles.button}>
        編集する
      </a>
    </main>
  );
}
