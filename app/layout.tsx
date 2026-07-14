import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'dkip — このTシャツの本物さは、DNS が保証しています',
  description:
    'あなたのドメインの公開鍵を DNS に刻み、誰でもブラウザから検証できる「本物」の証明つき T シャツをつくる。サーバーも認証局も不要。',
  openGraph: {
    title: 'dkip — このTシャツの本物さは、DNS が保証しています',
    description:
      'ドメインの公開鍵を DNS に刻んで、世界中の誰でも検証できる T シャツをつくる。',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#f6f8fc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
