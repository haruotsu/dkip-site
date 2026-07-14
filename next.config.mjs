/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // GitHub Pages のプロジェクトページ (https://<user>.github.io/dkip-site/) に置く場合は
  // NEXT_PUBLIC_BASE_PATH=/dkip-site を設定してビルドする。カスタムドメインなら不要。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
};

export default nextConfig;
