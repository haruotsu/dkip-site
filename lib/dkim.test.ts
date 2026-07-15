import { describe, it, expect } from 'vitest';
import { parseDkimTxt } from './dkim';

// 32 バイトの公開鍵 (0..31) の base64 標準表現
const KEY32 = Buffer.from(Array.from({ length: 32 }, (_, i) => i)).toString(
  'base64',
);

describe('parseDkimTxt', () => {
  it('v=DKIP1; k=ed25519; p=... から 32 バイト公開鍵を取り出す', () => {
    const result = parseDkimTxt(`v=DKIP1; k=ed25519; p=${KEY32}`);
    expect(result).not.toBeNull();
    expect(result!.k).toBe('ed25519');
    expect(result!.pubKeyBytes).toHaveLength(32);
    expect(result!.pubKeyBytes[0]).toBe(0);
    expect(result!.pubKeyBytes[31]).toBe(31);
  });

  it('前後のダブルクオートを除去して解釈する', () => {
    const result = parseDkimTxt(`"v=DKIP1; k=ed25519; p=${KEY32}"`);
    expect(result).not.toBeNull();
    expect(result!.pubKeyBytes).toHaveLength(32);
  });

  it('v=DKIM1 のメール用鍵レコードは null を返す', () => {
    expect(parseDkimTxt(`v=DKIM1; k=ed25519; p=${KEY32}`)).toBeNull();
  });

  it('v が無ければ null を返す', () => {
    expect(parseDkimTxt(`k=ed25519; p=${KEY32}`)).toBeNull();
  });

  it('k が ed25519 でなければ null を返す', () => {
    expect(parseDkimTxt(`v=DKIP1; k=rsa; p=${KEY32}`)).toBeNull();
  });

  it('公開鍵が 32 バイトでなければ null を返す', () => {
    const short = Buffer.from([1, 2, 3]).toString('base64');
    expect(parseDkimTxt(`v=DKIP1; k=ed25519; p=${short}`)).toBeNull();
  });

  it('p が無ければ null を返す', () => {
    expect(parseDkimTxt('v=DKIP1; k=ed25519')).toBeNull();
  });

  it('p のデコードに失敗したら null を返す', () => {
    expect(parseDkimTxt('v=DKIP1; k=ed25519; p=%%%')).toBeNull();
  });
});
