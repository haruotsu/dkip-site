'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseVerifyQuery } from '@/lib/query';
import { buildPayload } from '@/lib/payload';
import { resolveTXT } from '@/lib/doh';
import { parseDkimTxt } from '@/lib/dkim';
import { verifyEd25519 } from '@/lib/verify';
import { decodeBase64Url } from '@/lib/b64';
import TxtReveal from './TxtReveal';
import TryItYourself from './TryItYourself';
import ShareButton from './ShareButton';

type LineStatus = 'active' | 'ok' | 'ng';

interface LogLine {
  id: number;
  icon: string;
  text: string;
  detail?: string;
  status: LineStatus;
}

type Verdict =
  | { kind: 'verified' }
  | { kind: 'failed'; reason: string }
  | { kind: 'unresolved' }
  | { kind: 'error'; reason: string };

interface TxtEvidence {
  name: string;
  records: string[];
  resolver: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: (i * 137.5) % 100,
        delay: ((i * 97) % 140) / 100,
        duration: 2.4 + ((i * 31) % 120) / 100,
        hue: (i * 47) % 360,
        size: 6 + ((i * 13) % 7),
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: p.size,
            height: p.size * 0.45,
            background: `hsl(${p.hue} 90% 65%)`,
          }}
        />
      ))}
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="./">
        <span className="brand-mark" aria-hidden>
          ◈
        </span>
        dkip
      </a>
      <a
        className="header-link"
        href="https://github.com/haruotsu/dkip"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub ↗
      </a>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      “このTシャツの本物さは、DNS が保証しています。”
    </footer>
  );
}

function ResultCard({
  verdict,
  d,
  y,
  t,
}: {
  verdict: Verdict;
  d?: string;
  y?: string;
  t?: string;
}) {
  if (verdict.kind === 'verified') {
    return (
      <div className="result result-verified">
        <div className="result-mark" aria-hidden>
          ✅
        </div>
        <h1 className="result-title">
          <span className="result-domain">{d}</span> は本物です
        </h1>
        {y && y !== 'unknown' && <p className="result-since">since {y}</p>}
        <p className="result-desc">
          このドメインの所有者が {t} に発行したことを、DNS
          に刻まれた公開鍵が証明しています。いまレコードが残っている＝いまも有効です。
        </p>
        <ShareButton d={d!} y={y ?? 'unknown'} />
      </div>
    );
  }
  const title =
    verdict.kind === 'unresolved'
      ? '失効または未登録'
      : verdict.kind === 'error'
        ? 'DNS に到達できませんでした'
        : '検証できませんでした';
  const desc =
    verdict.kind === 'unresolved'
      ? 'DNS に公開鍵が見つかりませんでした。発行後に TXT レコードが削除されると、この証明は失効します。'
      : verdict.kind === 'error' || verdict.kind === 'failed'
        ? verdict.reason
        : '';
  return (
    <div className="result result-failed">
      <div className="result-mark" aria-hidden>
        {verdict.kind === 'error' ? '⚠️' : '❌'}
      </div>
      <h1 className="result-title">{title}</h1>
      <p className="result-desc">{desc}</p>
    </div>
  );
}

export default function Verifier() {
  const params = useSearchParams();
  const query = useMemo(() => parseVerifyQuery(params), [params]);

  const [lines, setLines] = useState<LogLine[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [evidence, setEvidence] = useState<TxtEvidence | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (query.mode !== 'verify' || started.current) return;
    started.current = true;

    const nextId = { n: 0 };
    const push = (icon: string, text: string, detail?: string): number => {
      const id = nextId.n++;
      setLines((ls) => [...ls, { id, icon, text, detail, status: 'active' }]);
      return id;
    };
    const settle = (
      id: number,
      status: LineStatus,
      text?: string,
      detail?: string,
    ) => {
      setLines((ls) =>
        ls.map((l) =>
          l.id === id
            ? {
                ...l,
                status,
                text: text ?? l.text,
                detail: detail ?? l.detail,
              }
            : l,
        ),
      );
    };

    (async () => {
      const { d, y, t, n, sig, selector } = query;
      const payload = buildPayload(d, y, t, n);
      const name = `${selector}._domainkey.${d}`;

      const l1 = push('📨', '検証パラメータを読み取りました', `payload: ${payload}`);
      await sleep(500);
      settle(l1, 'ok');

      const l2 = push('📡', 'DNS を照会しています…', `TXT ${name}`);
      await sleep(600);

      let records: string[];
      let resolver: string;
      try {
        const res = await resolveTXT(name);
        records = res.records;
        resolver = res.resolver;
      } catch {
        settle(l2, 'ng', 'DNS に到達できませんでした');
        setVerdict({
          kind: 'error',
          reason:
            'DNS リゾルバ（Cloudflare / Google DoH）に到達できませんでした。ネットワークを確認して再読み込みしてください。',
        });
        return;
      }

      setEvidence({ name, records, resolver });

      const dkimTxt = records.find(
        (r) => r.includes('v=DKIM1') && r.includes('p='),
      );
      if (!dkimTxt) {
        settle(l2, 'ng', 'DNS に公開鍵が見つかりません', `TXT ${name}`);
        setVerdict({ kind: 'unresolved' });
        return;
      }
      settle(l2, 'ok', 'TXT レコードを取得しました', `TXT ${name}  (via ${resolver})`);

      const l3 = push('🔑', '公開鍵を取り出しています…');
      await sleep(500);
      const key = parseDkimTxt(dkimTxt);
      if (!key) {
        settle(l3, 'ng', '公開鍵を読み取れませんでした');
        setVerdict({
          kind: 'failed',
          reason: 'TXT レコードはありますが、Ed25519 公開鍵として解釈できません。',
        });
        return;
      }
      settle(l3, 'ok', '公開鍵を取り出しました', 'Ed25519 / 32 bytes');

      const l4 = push('✍️', 'Ed25519 署名を検証しています…');
      await sleep(600);

      let sigBytes: Uint8Array;
      try {
        sigBytes = decodeBase64Url(sig);
      } catch {
        settle(l4, 'ng', '署名の形式が不正です');
        setVerdict({
          kind: 'failed',
          reason: '署名をデコードできませんでした。URL が欠けている可能性があります。',
        });
        return;
      }

      const msgBytes = new TextEncoder().encode(payload);
      let ok = false;
      try {
        ok = await verifyEd25519(key.pubKeyBytes, msgBytes, sigBytes);
      } catch {
        ok = false;
      }

      if (ok) {
        settle(l4, 'ok', '署名は正しいことが確認できました');
        await sleep(350);
        setVerdict({ kind: 'verified' });
      } else {
        settle(l4, 'ng', '署名が一致しませんでした');
        setVerdict({
          kind: 'failed',
          reason: 'DNS 上の公開鍵では、この署名を検証できませんでした。',
        });
      }
    })();
  }, [query]);

  // クエリなし（QR 以外の入口）
  if (query.mode === 'landing') {
    return (
      <div className="page">
        <Header />
        <main className="container">
          <p className="landing-lead">
            自分のドメインの公開鍵を DNS に刻んで、「本物」の証明つき T
            シャツをつくるツール、dkip の検証ページです。 T シャツの QR
            コードを開くと、ブラウザが直接 DNS
            を照会して署名を検証し、ここに結果を表示します。
          </p>
          <TryItYourself />
        </main>
        <Footer />
      </div>
    );
  }

  // パラメータ形式エラー（payload インジェクション含む）
  if (query.mode === 'invalid') {
    return (
      <div className="page">
        <Header />
        <main className="container">
          <ResultCard
            verdict={{
              kind: 'failed',
              reason:
                '検証 URL のパラメータが正しい形式ではありません。QR コードをもう一度読み取ってください。',
            }}
          />
          <TryItYourself />
        </main>
        <Footer />
      </div>
    );
  }

  const { d, y, t } = query;
  const done = verdict !== null;

  return (
    <div className="page">
      {verdict?.kind === 'verified' && <Confetti />}
      <Header />
      <main className="container">
        <div className="term" role="log" aria-live="polite">
          <div className="code-card-head">
            <span className="code-dots" aria-hidden>
              <i /><i /><i />
            </span>
            <span className="code-card-label">dkip verify — {d}</span>
          </div>
          <div className="term-body">
            {lines.map((l) => (
              <div key={l.id} className={`term-line term-${l.status}`}>
                <span className="term-icon" aria-hidden>
                  {l.icon}
                </span>
                <span className="term-text">
                  {l.text}
                  {l.status === 'active' && <span className="caret" />}
                  {l.detail && <span className="term-detail">{l.detail}</span>}
                </span>
                <span className="term-mark" aria-hidden>
                  {l.status === 'ok' ? '✓' : l.status === 'ng' ? '✕' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {done && <ResultCard verdict={verdict} d={d} y={y} t={t} />}

        {evidence && evidence.records.length > 0 && (
          <TxtReveal
            name={evidence.name}
            records={evidence.records}
            resolver={evidence.resolver}
          />
        )}

        {done && (
          <p className="verify-note">
            検証はすべてこのブラウザの中で行われました。サーバーには何も送信されていません。
          </p>
        )}

        {done && <TryItYourself />}
      </main>
      <Footer />
    </div>
  );
}
