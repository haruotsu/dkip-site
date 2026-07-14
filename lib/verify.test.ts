import { describe, it, expect } from 'vitest';
import * as ed from '@noble/ed25519';
import { verifyEd25519 } from './verify';

// テスト用の固定鍵ペア（秘密鍵 32 バイト = 1 埋め）
const priv = new Uint8Array(32).fill(1);

async function sign(msg: Uint8Array): Promise<Uint8Array> {
  return ed.signAsync(msg, priv);
}

describe('verifyEd25519', () => {
  it('正しい署名で true を返す', async () => {
    const pub = await ed.getPublicKeyAsync(priv);
    const msg = new TextEncoder().encode('example.com|2014|2026-07-14|9f3a1c');
    const sig = await sign(msg);
    expect(await verifyEd25519(pub, msg, sig)).toBe(true);
  });

  it('改竄されたメッセージで false を返す', async () => {
    const pub = await ed.getPublicKeyAsync(priv);
    const msg = new TextEncoder().encode('example.com|2014|2026-07-14|9f3a1c');
    const sig = await sign(msg);
    const tampered = new TextEncoder().encode(
      'evil.example.com|2014|2026-07-14|9f3a1c',
    );
    expect(await verifyEd25519(pub, tampered, sig)).toBe(false);
  });

  it('署名が 1 バイト違うと false を返す', async () => {
    const pub = await ed.getPublicKeyAsync(priv);
    const msg = new TextEncoder().encode('example.com|2014|2026-07-14|9f3a1c');
    const sig = await sign(msg);
    const broken = new Uint8Array(sig);
    broken[0] ^= 0xff;
    expect(await verifyEd25519(pub, msg, broken)).toBe(false);
  });
});
