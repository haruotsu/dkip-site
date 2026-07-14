'use client';

import { useEffect, useState } from 'react';
import { buildShareText, buildTweetIntentUrl } from '@/lib/share';

// 検証成功画面から X に共有するボタン。リンクを開くだけで、投稿は本人が X 側で確定する。
export default function ShareButton({ d, y }: { d: string; y: string }) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    const verifyUrl = window.location.origin + window.location.pathname + window.location.search;
    setHref(buildTweetIntentUrl(buildShareText(d, y), verifyUrl));
  }, [d, y]);

  if (!href) return null;

  return (
    <a
      className="share-btn"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span aria-hidden>𝕏</span> で共有する
    </a>
  );
}
