// 署名対象文字列の復元。発行 CLI の buildPayload と 1 文字も違えないこと。
export function buildPayload(
  d: string,
  y: string,
  t: string,
  n: string,
): string {
  return `${d}|${y}|${t}|${n}`;
}
