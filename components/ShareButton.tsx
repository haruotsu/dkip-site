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
    // 本文に載せる検証 URL からは item を除く（商品リンクは url パラメータ側にあるため）
    const params = new URLSearchParams(window.location.search);
    params.delete('item');
    const verifyUrl = `${window.location.origin}${window.location.pathname}?${params}`;
    // item があるときは商品ページをリンク先にし、検証 URL は本文に載せる
    const text = buildShareText(d, y, item ? verifyUrl : undefined);
    setHref(buildTweetIntentUrl(text, item ?? verifyUrl));
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
