'use client';

// 実際に DNS から取得した TXT レコードをそのまま見せる「魔法の種明かし」。
export default function TxtReveal({
  name,
  records,
  resolver,
}: {
  name: string;
  records: string[];
  resolver: string;
}) {
  return (
    <details className="txt-reveal">
      <summary>
        <span className="txt-reveal-icon">🔬</span>
        DNS から実際に取得したレコードを見る
      </summary>
      <div className="txt-reveal-body">
        <p className="txt-reveal-meta">
          <code>{name}</code> の TXT レコード
          <span className="txt-reveal-resolver">via {resolver} DoH</span>
        </p>
        <pre className="txt-reveal-pre">
          {records.length > 0 ? records.join('\n') : '(レコードなし)'}
        </pre>
        <p className="txt-reveal-note">
          このレコードは世界中のどの DNS リゾルバからでも、いまこの瞬間に引けます。
          <code>dig TXT {name}</code> で手元からも確認できます。
        </p>
      </div>
    </details>
  );
}
