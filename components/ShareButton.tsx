'use client';

import { useEffect, useState } from 'react';
import { buildShareText, buildTweetIntentUrl } from '@/lib/share';

// 検証成功画面から X に共有するボタン。リンクを開くだけで、投稿は本人が X 側で確定する。
// シェアする URL は T シャツの販売ページ（item）。無ければ検証 URL にフォールバック。
export default function ShareButton({
  d,
  y,
  item,
}: {
  d: string;
  y: string;
  item?: string;
}) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    // リンク先は商品ページ。無ければ検証 URL（現在の URL）にフォールバック
    const verifyUrl =
      window.location.origin + window.location.pathname + window.location.search;
    setHref(buildTweetIntentUrl(buildShareText(d, y), item ?? verifyUrl));
  }, [d, y, item]);

  if (!href) return null;

  return (
    <div className="share-row">
      <a
        className="share-btn"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span aria-hidden>𝕏</span> で共有する
      </a>
      {item && (
        <a
          className="item-link"
          href={item}
          target="_blank"
          rel="noopener noreferrer"
        >
          👕 この T シャツの商品ページ ↗
        </a>
      )}
    </div>
  );
}
