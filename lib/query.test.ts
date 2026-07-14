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
