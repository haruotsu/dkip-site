// X (Twitter) シェア用のテキストと intent URL の組み立て。

const HASHTAGS = '#ムームードメインAPI #SUZURI';

// verifyUrl は intent の url パラメータが商品ページを指すとき（=検証 URL が
// 本文に出ないとき）だけ渡す。無指定なら重複を避けて省略する。
export function buildShareText(
  d: string,
  y: string,
  verifyUrl?: string,
): string {
  const since = y && y !== 'unknown' ? `（since ${y}）` : '';
  const lines = [
    `✅ ${d} は本物です${since}`,
    'このTシャツの本物さは、DNS が保証しています。',
  ];
  if (verifyUrl) lines.push(`🔎 検証: ${verifyUrl}`);
  lines.push(HASHTAGS);
  return lines.join('\n');
}

export function buildTweetIntentUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text, url });
  return `https://x.com/intent/post?${params}`;
}
