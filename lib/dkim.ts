import { decodeBase64Std } from './b64';

export interface DkimKey {
  k: string;
  pubKeyBytes: Uint8Array;
}

// TXT 値 `v=DKIP1; k=ed25519; p=<base64>` をパースして Ed25519 公開鍵 (32 バイト) を取り出す。
export function parseDkimTxt(txt: string): DkimKey | null {
  const unquoted = txt.replace(/^"|"$/g, '');
  const fields = new Map<string, string>();
  for (const part of unquoted.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    fields.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }

  const v = fields.get('v') ?? '';
  const k = fields.get('k') ?? '';
  const p = fields.get('p');
  if (v !== 'DKIP1' || k !== 'ed25519' || !p) return null;

  let pubKeyBytes: Uint8Array;
  try {
    pubKeyBytes = decodeBase64Std(p);
  } catch {
    return null;
  }
  if (pubKeyBytes.length !== 32) return null;

  return { k, pubKeyBytes };
}
