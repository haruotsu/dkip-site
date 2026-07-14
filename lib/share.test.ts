import { describe, it, expect } from 'vitest';
import { buildShareText, buildTweetIntentUrl } from './share';

describe('buildShareText', () => {
  it('ドメイン・取得年・ハッシュタグ入りのシェア文を組み立てる', () => {
    expect(buildShareText('example.com', '2014')).toBe(
      '✅ example.com は本物です（since 2014）\n' +
        'このTシャツの本物さは、DNS が保証しています。\n' +
        '#ムームードメインAPI #SUZURI',
    );
  });

  it('y=unknown のときは since を含めない', () => {
    expect(buildShareText('example.com', 'unknown')).toBe(
      '✅ example.com は本物です\n' +
        'このTシャツの本物さは、DNS が保証しています。\n' +
        '#ムームードメインAPI #SUZURI',
    );
  });

  it('verifyUrl を渡すと検証 URL の行をハッシュタグの前に入れる', () => {
    expect(
      buildShareText(
        'haki.jp',
        '2026',
        'https://dkip-site.lolipop-now.app/?d=haki.jp&sig=x',
      ),
    ).toBe(
      '✅ haki.jp は本物です（since 2026）\n' +
        'このTシャツの本物さは、DNS が保証しています。\n' +
        '🔎 検証: https://dkip-site.lolipop-now.app/?d=haki.jp&sig=x\n' +
        '#ムームードメインAPI #SUZURI',
    );
  });
});

describe('buildTweetIntentUrl', () => {
  it('text と url を URL エンコードして intent URL を組み立てる', () => {
    const url = buildTweetIntentUrl(
      '✅ 本物です',
      'https://suzuri.jp/YokoPhys/20400056/t-shirt/s/white',
    );
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://x.com/intent/post');
    expect(parsed.searchParams.get('text')).toBe('✅ 本物です');
    expect(parsed.searchParams.get('url')).toBe(
      'https://suzuri.jp/YokoPhys/20400056/t-shirt/s/white',
    );
  });
});
