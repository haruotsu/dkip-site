import { describe, it, expect } from 'vitest';
import { buildShareText, buildTweetIntentUrl } from './share';

describe('buildShareText', () => {
  it('ドメインと取得年からシェア文を組み立てる', () => {
    expect(buildShareText('example.com', '2014')).toBe(
      '✅ example.com は本物です（since 2014）\nこのTシャツの本物さは、DNS が保証しています。',
    );
  });

  it('y=unknown のときは since を含めない', () => {
    expect(buildShareText('example.com', 'unknown')).toBe(
      '✅ example.com は本物です\nこのTシャツの本物さは、DNS が保証しています。',
    );
  });
});

describe('buildTweetIntentUrl', () => {
  it('text と url を URL エンコードして intent URL を組み立てる', () => {
    const url = buildTweetIntentUrl(
      '✅ 本物です',
      'https://verify.example/?d=example.com&sig=x',
    );
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://x.com/intent/post');
    expect(parsed.searchParams.get('text')).toBe('✅ 本物です');
    expect(parsed.searchParams.get('url')).toBe(
      'https://verify.example/?d=example.com&sig=x',
    );
  });
});
