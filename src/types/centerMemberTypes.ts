// src/types/centerMemberTypes.ts
export type CenterMember = {
  member_id: number;
  old_member_id: number | null;
  name: string;
  name_kana: string | null;
  address: string | null;
  tel: string | null;
  mobile_phone: string | null;
  birthday: string | null;
  type_of_disability: string;
  updated_at: string; // dateStrings オプションで文字列
};
