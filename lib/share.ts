// X (Twitter) シェア用のテキストと intent URL の組み立て。

const HASHTAGS = '#ムームードメインAPI #SUZURI';

export function buildShareText(d: string, y: string): string {
  const since = y && y !== 'unknown' ? `（since ${y}）` : '';
  return [
    `✅ ${d} は本物です${since}`,
    'このTシャツは、ドメインの所有者が発行したものだと DNS が保証しています。',
    HASHTAGS,
  ].join('\n');
}

// x.com/intent/post だとスマホで未ログインの Web 版が開いてしまう。
// twitter.com/intent/tweet は X アプリがユニバーサルリンクとして横取りするので、
// アプリの投稿画面が直接開く（ログイン要求されない）。
export function buildTweetIntentUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text, url });
  return `https://twitter.com/intent/tweet?${params}`;
}
