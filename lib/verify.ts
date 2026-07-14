// Ed25519 署名検証。WebCrypto を試し、未対応ブラウザでは @noble/ed25519 にフォールバック。

async function verifyWithWebCrypto(
  pub: Uint8Array,
  msg: Uint8Array,
  sig: Uint8Array,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    pub as BufferSource,
    { name: 'Ed25519' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    { name: 'Ed25519' },
    key,
    sig as BufferSource,
    msg as BufferSource,
  );
}

async function verifyWithNoble(
  pub: Uint8Array,
  msg: Uint8Array,
  sig: Uint8Array,
): Promise<boolean> {
  const ed = await import('@noble/ed25519');
  return ed.verifyAsync(sig, msg, pub);
}

export async function verifyEd25519(
  pub: Uint8Array,
  msg: Uint8Array,
  sig: Uint8Array,
): Promise<boolean> {
  try {
    return await verifyWithWebCrypto(pub, msg, sig);
  } catch {
    return verifyWithNoble(pub, msg, sig);
  }
}
