// base64 デコードの集約点。CLI との取り決め:
//   署名 sig    … base64url パディングなし
//   公開鍵 p=   … base64 標準 パディングあり

function decode(b64std: string): Uint8Array {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64std)) {
    throw new Error('invalid base64 input');
  }
  const bin = atob(b64std);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export function decodeBase64Url(input: string): Uint8Array {
  const std = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = std + '='.repeat((4 - (std.length % 4)) % 4);
  return decode(padded);
}

export function decodeBase64Std(input: string): Uint8Array {
  return decode(input);
}
