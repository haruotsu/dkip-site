// 検証 URL のクエリ ?d=&y=&t=&n=&sig=(&s=) の解釈。
// - d か sig が欠けていたらランディング（入口）として扱う
// - 値の文字種が契約と合わない場合は invalid（即 ❌）。
//   特に `|` を含む値は payload の区切りを偽装できるため必ず弾く。

export const DEFAULT_SELECTOR = 'dkip';

const RE = {
  d: /^[a-z0-9.-]+$/i,
  y: /^(\d{4}|unknown)$/,
  t: /^\d{4}-\d{2}-\d{2}$/,
  n: /^[0-9a-f]{6}$/,
  sig: /^[A-Za-z0-9_-]+$/,
  s: /^[a-z0-9-]+$/,
} as const;

export type VerifyQuery =
  | {
      mode: 'verify';
      d: string;
      y: string;
      t: string;
      n: string;
      sig: string;
      selector: string;
    }
  | { mode: 'landing' }
  | { mode: 'invalid' };

export function parseVerifyQuery(params: URLSearchParams): VerifyQuery {
  const d = params.get('d');
  const sig = params.get('sig');
  if (!d || !sig) return { mode: 'landing' };

  const y = params.get('y') ?? 'unknown';
  const t = params.get('t') ?? '';
  const n = params.get('n') ?? '';
  const selector = params.get('s') || DEFAULT_SELECTOR;

  if (
    !RE.d.test(d) ||
    !RE.y.test(y) ||
    !RE.t.test(t) ||
    !RE.n.test(n) ||
    !RE.sig.test(sig) ||
    !RE.s.test(selector)
  ) {
    return { mode: 'invalid' };
  }

  return { mode: 'verify', d, y, t, n, sig, selector };
}
