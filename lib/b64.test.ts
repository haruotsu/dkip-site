import { describe, it, expect } from 'vitest';
import { decodeBase64Url, decodeBase64Std } from './b64';

describe('decodeBase64Url', () => {
  it('パディングなし base64url をバイト列にデコードできる', () => {
    // "hello" = aGVsbG8 (base64url, no padding)
    expect(decodeBase64Url('aGVsbG8')).toEqual(
      new Uint8Array([104, 101, 108, 108, 111]),
    );
  });

  it('URL-safe 文字 (-, _) を含む入力をデコードできる', () => {
    // 0xfb 0xff 0xbf → base64std "+/+/" → base64url "-_-_"
    expect(decodeBase64Url('-_-_')).toEqual(new Uint8Array([0xfb, 0xff, 0xbf]));
  });

  it('不正な入力で例外を投げる', () => {
    expect(() => decodeBase64Url('!!!!')).toThrow();
  });
});

describe('decodeBase64Std', () => {
  it('パディングあり標準 base64 をデコードできる', () => {
    expect(decodeBase64Std('aGVsbG8=')).toEqual(
      new Uint8Array([104, 101, 108, 108, 111]),
    );
  });

  it('不正な入力で例外を投げる', () => {
    expect(() => decodeBase64Std('%%%')).toThrow();
  });
});
