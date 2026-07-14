'use client';

import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // クリップボード非対応環境では何もしない
    }
  }

  return (
    <button type="button" className="copy-btn" onClick={copy}>
      {copied ? 'コピーしました ✓' : 'コピー'}
    </button>
  );
}
