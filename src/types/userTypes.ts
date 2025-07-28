// src/types/userTypes.ts

export type UserRow = {
  user_id: number;
  email: string;
  password: string;
  start_date: string | null;
  end_date: string | null;
  work_place: number | null;
  last_name: string | null;
  last_name_kana: string | null;
  first_name: string | null;
  first_name_kana: string | null;
  user_type_id: number | null;
  birthday: string | null;
  tm: string;
  postcode: string | null;
  pref_id: number | null;
  city: string | null;
  block: string | null;
  building: string | null;
  phone_number: string | null;
  mobile_phone: string | null;
  receiving_number: string | null;
  handicap_name: string | null;
  support_office: string | null;
  support_personnel: string | null;
  support_phone: string | null;
  remarks: string | null;
  account_number: number;
  usage_fee: number;
  subsidy: number;
  classification: number | null;
  handicap_class: number;
  handicap_number: string;
  handicap_type: number;
  handicap_grade: number;
  usage_situation: number;
  b_group_id: number;
  sex: number;
  jobdata_user: number;
  human_support: string;

  // JOIN 先テーブル（最新1件）
  usage_start_date: string | null;
  usage_end_date: string | null;
  payment_start_date: string | null;
  payment_end_date: string | null;
};
