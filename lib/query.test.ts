import { describe, it, expect } from 'vitest';
import { parseVerifyQuery } from './query';

function params(q: Record<string, string>): URLSearchParams {
  return new URLSearchParams(q);
}

describe('parseVerifyQuery', () => {
  it('d, y, t, n, sig が揃っていれば verify モードで各値を返す', () => {
    const result = parseVerifyQuery(
      params({
        d: 'example.com',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'Xy_-123',
      }),
    );
    expect(result).toEqual({
      mode: 'verify',
      d: 'example.com',
      y: '2014',
      t: '2026-07-14',
      n: '9f3a1c',
      sig: 'Xy_-123',
      selector: 'dkip',
    });
  });

  it('d が無ければ landing モード', () => {
    const result = parseVerifyQuery(params({ sig: 'x' }));
    expect(result.mode).toBe('landing');
  });

  it('sig が無ければ landing モード', () => {
    const result = parseVerifyQuery(params({ d: 'example.com' }));
    expect(result.mode).toBe('landing');
  });

  it('d に | が含まれていたら invalid（payload インジェクション対策）', () => {
    const result = parseVerifyQuery(
      params({
        d: 'a.com|2014',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'x',
      }),
    );
    expect(result.mode).toBe('invalid');
  });

  it('y が 4 桁数字でも unknown でもなければ invalid', () => {
    const result = parseVerifyQuery(
      params({ d: 'a.com', y: '20x4', t: '2026-07-14', n: '9f3a1c', sig: 'x' }),
    );
    expect(result.mode).toBe('invalid');
  });

  it('t が YYYY-MM-DD 形式でなければ invalid', () => {
    const result = parseVerifyQuery(
      params({ d: 'a.com', y: '2014', t: '2026/07/14', n: '9f3a1c', sig: 'x' }),
    );
    expect(result.mode).toBe('invalid');
  });

  it('n が 16 進 6 文字でなければ invalid', () => {
    const result = parseVerifyQuery(
      params({ d: 'a.com', y: '2014', t: '2026-07-14', n: 'ZZZZZZ', sig: 'x' }),
    );
    expect(result.mode).toBe('invalid');
  });

  it('sig に base64url 以外の文字が含まれていたら invalid', () => {
    const result = parseVerifyQuery(
      params({ d: 'a.com', y: '2014', t: '2026-07-14', n: '9f3a1c', sig: 'x|y' }),
    );
    expect(result.mode).toBe('invalid');
  });

  it('s が [a-z0-9-]+ 以外なら invalid', () => {
    const result = parseVerifyQuery(
      params({
        d: 'a.com',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'x',
        s: 'Bad_Selector',
      }),
    );
    expect(result.mode).toBe('invalid');
  });

  it('item が https://suzuri.jp/... なら verify 結果に含める', () => {
    const result = parseVerifyQuery(
      params({
        d: 'example.com',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'x',
        item: 'https://suzuri.jp/haruotsu/12345/t-shirt/s/white',
      }),
    );
    expect(result.mode).toBe('verify');
    if (result.mode === 'verify') {
      expect(result.item).toBe(
        'https://suzuri.jp/haruotsu/12345/t-shirt/s/white',
      );
    }
  });

  it('suzuri.jp 以外のホストの item は無視する', () => {
    const result = parseVerifyQuery(
      params({
        d: 'example.com',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'x',
        item: 'https://evil.example/phish',
      }),
    );
    expect(result.mode).toBe('verify');
    if (result.mode === 'verify') {
      expect(result.item).toBeUndefined();
    }
  });

  it('http/https 以外のスキームの item は無視する', () => {
    const result = parseVerifyQuery(
      params({
        d: 'example.com',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'x',
        item: 'javascript:alert(1)',
      }),
    );
    expect(result.mode).toBe('verify');
    if (result.mode === 'verify') {
      expect(result.item).toBeUndefined();
    }
  });

  it('evil-suzuri.jp のような偽ホストを拒否し、*.suzuri.jp は許可する', () => {
    const fake = parseVerifyQuery(
      params({
        d: 'example.com',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'x',
        item: 'https://evil-suzuri.jp/x',
      }),
    );
    if (fake.mode === 'verify') {
      expect(fake.item).toBeUndefined();
    }
    const sub = parseVerifyQuery(
      params({
        d: 'example.com',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'x',
        item: 'https://shop.suzuri.jp/x',
      }),
    );
    if (sub.mode === 'verify') {
      expect(sub.item).toBe('https://shop.suzuri.jp/x');
    }
  });

  it('suzuri.jp の http は https に昇格して受け入れる（印刷済み QR の互換性）', () => {
    const result = parseVerifyQuery(
      params({
        d: 'example.com',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'x',
        item: 'http://suzuri.jp/YokoPhys/20400056/t-shirt/s/white',
      }),
    );
    expect(result.mode).toBe('verify');
    if (result.mode === 'verify') {
      expect(result.item).toBe(
        'https://suzuri.jp/YokoPhys/20400056/t-shirt/s/white',
      );
    }
  });

  it('s クエリで selector を上書きできる', () => {
    const result = parseVerifyQuery(
      params({
        d: 'example.com',
        y: '2014',
        t: '2026-07-14',
        n: '9f3a1c',
        sig: 'x',
        s: 'dkip2',
      }),
    );
    expect(result.mode).toBe('verify');
    if (result.mode === 'verify') {
      expect(result.selector).toBe('dkip2');
    }
  });
});
