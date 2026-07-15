import CopyButton from './CopyButton';

const COMMANDS = `export MUU_PAT=<ムームードメインの PAT>        # domains:read, dns:write
export SUZURI_API_KEY=<SUZURI の API キー>

go install github.com/haruotsu/dkip@latest
dkip example.com   # ムームードメインで所有中のドメイン`;

// 成功・失敗どちらの画面にも出す「あなたもやろう」導線。
export default function TryItYourself() {
  return (
    <section className="try-section">
      <h2 className="try-title">やりかた</h2>
      <div className="code-card">
        <div className="code-card-head">
          <span className="code-dots" aria-hidden>
            <i /><i /><i />
          </span>
          <CopyButton text={COMMANDS} />
        </div>
        <pre className="code-pre">{COMMANDS}</pre>
      </div>
      <ul className="try-links">
        <li>
          🛠 Go が未インストールなら <code>brew install go</code>
        </li>
        <li>
          🌐 ムームードメインの PAT（スコープ: <code>domains:read</code> /{' '}
          <code>dns:write</code>）—{' '}
          <a
            href="https://muumuu-domain.com/developers/"
            target="_blank"
            rel="noopener noreferrer"
          >
            開発者ページ ↗
          </a>
        </li>
        <li>
          👕 SUZURI の API キー —{' '}
          <a
            href="https://suzuri.jp/developer/documentation/v1"
            target="_blank"
            rel="noopener noreferrer"
          >
            API v1 ドキュメント ↗
          </a>
        </li>
        <li>
          📦 ソースコード —{' '}
          <a
            href="https://github.com/haruotsu/dkip"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
        </li>
      </ul>
    </section>
  );
}
