// X (Twitter) シェア用のテキストと intent URL の組み立て。

const HASHTAGS = '#ムームードメインAPI #SUZURI';

export function buildShareText(d: string, y: string): string {
  const since = y && y !== 'unknown' ? `（since ${y}）` : '';
  return [
    `✅ ${d} は本物です${since}`,
    'このTシャツの本物さは、DNS が保証しています。',
    HASHTAGS,
  ].join('\n');
}

export function buildTweetIntentUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text, url });
  return `https://x.com/intent/post?${params}`;
}
