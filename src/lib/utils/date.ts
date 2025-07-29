export function toWareki(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr === "0000-00-00") return "";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const wareki = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
    era: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  // 明治時代（1800年代）以前は基本的に不正データとみなす
  if (wareki.startsWith("明治")) return "";

  return wareki;
}
