# dkip-site

[dkip](https://github.com/haruotsu/dkip) が発行する「DNS-signed tee」の検証サイト。

T シャツの QR コード（検証 URL）を開くと、**ブラウザが直接 DNS を照会して** Ed25519 署名を検証し、`✅ <domain> は本物です` を表示します。サーバーには何も送信されません。

## しくみ

1. 検証 URL のクエリ `?d=&y=&t=&n=&sig=` から署名対象文字列を復元
2. DoH（Cloudflare → Google フォールバック）で `<selector>._domainkey.<domain>` の TXT を取得
3. TXT の `p=` から Ed25519 公開鍵（32 バイト）を取り出す
4. WebCrypto（未対応ブラウザは `@noble/ed25519`）で署名を検証

クエリなしで開いた場合は、プロダクト紹介＋オンボーディングのランディングページになります。

## 開発

```sh
npm install
npm run dev    # 開発サーバー
npm test       # 検証ロジックのユニットテスト (vitest)
npm run build  # 静的エクスポート (out/)
```

## デプロイ

`npm run build` で `out/` に静的ファイルが出るので、任意の静的ホスティングに置く。

- サブパス（例: `https://<user>.github.io/dkip-site/`）で公開する場合は `NEXT_PUBLIC_BASE_PATH=/dkip-site npm run build`
- ルート直下（カスタムドメイン等）ならそのまま `npm run build`

## 関連リンク

- [dkip（発行 CLI）](https://github.com/haruotsu/dkip)
- [ムームードメイン API](https://muumuu-domain.com/developers/)
- [SUZURI API v1](https://suzuri.jp/developer/documentation/v1)
