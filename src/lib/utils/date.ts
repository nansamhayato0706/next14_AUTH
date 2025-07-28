export function toWareki(dateStr: string | null | undefined): string {
  if (!dateStr) return "―";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "―";

  return new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
    era: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
