// DoH (DNS over HTTPS, JSON API) で TXT レコードを引く。
// Cloudflare → Google の順に試す（片方が CORS/障害でも動くように）。

export interface TxtResult {
  records: string[];
  resolver: 'cloudflare' | 'google';
}

interface DohAnswer {
  name: string;
  type: number;
  data: string;
}

interface DohResponse {
  Status: number;
  Answer?: DohAnswer[];
}

const TYPE_TXT = 16;

// `"abc" "def"` のような 255 バイト分割表現を結合し、素の TXT 値にする。
function normalizeTxtData(data: string): string {
  const chunks = data.match(/"((?:[^"\\]|\\.)*)"/g);
  if (chunks) {
    return chunks.map((c) => c.slice(1, -1)).join('');
  }
  return data;
}

async function query(
  url: string,
  resolver: TxtResult['resolver'],
): Promise<TxtResult> {
  const res = await fetch(url, {
    headers: { Accept: 'application/dns-json' },
  });
  if (!res.ok) {
    throw new Error(`DoH ${resolver} responded ${res.status}`);
  }
  const json = (await res.json()) as DohResponse;
  const records = (json.Answer ?? [])
    .filter((a) => a.type === TYPE_TXT)
    .map((a) => normalizeTxtData(a.data));
  return { records, resolver };
}

export async function resolveTXT(name: string): Promise<TxtResult> {
  try {
    return await query(
      `https://cloudflare-dns.com/dns-query?name=${name}&type=TXT`,
      'cloudflare',
    );
  } catch {
    return query(`https://dns.google/resolve?name=${name}&type=TXT`, 'google');
  }
}
