/** @type {import('next').NextConfig} */
const nextConfig = {
  // ロリポップ (lolipop deploy) では NEXT_OUTPUT=standalone でビルドする。
  // 未指定なら静的エクスポート (out/) で、GitHub Pages 等にそのまま置ける。
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : 'export',
  images: { unoptimized: true },
  // GitHub Pages のプロジェクトページ (https://<user>.github.io/dkip-site/) に置く場合は
  // NEXT_PUBLIC_BASE_PATH=/dkip-site を設定してビルドする。カスタムドメインなら不要。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
};

export default nextConfig;
