'use client';

import { useState } from 'react';

// 検証に成功したドメインのサイトへ誘導するリッチカード。
// OGP はサーバーを介さず取得できないため（このサイトの「サーバーに何も送らない」原則と
// 静的エクスポート両対応のため）、ドメイン名・favicon・URL だけのシンプルなカードにする。
export default function DomainLinkCard({ d }: { d: string }) {
  const [faviconOk, setFaviconOk] = useState(true);
  const href = `https://${d}`;
  // favicon は対象ドメイン自身から直接読む（第三者サービスを経由しない）。
  const faviconSrc = `https://${d}/favicon.ico`;

  return (
    <a
      className="domain-card"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="domain-card-icon" aria-hidden>
        {faviconOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconSrc}
            alt=""
            width={40}
            height={40}
            onError={() => setFaviconOk(false)}
          />
        ) : (
          <span className="domain-card-glyph">🌐</span>
        )}
      </span>
      <span className="domain-card-body">
        <span className="domain-card-title">{d}</span>
        <span className="domain-card-url">{href}</span>
      </span>
      <span className="domain-card-arrow" aria-hidden>
        ↗
      </span>
    </a>
  );
}
