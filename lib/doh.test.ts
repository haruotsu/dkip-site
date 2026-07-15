import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveTXT } from './doh';

const NAME = 'dkip._domainkey.example.com';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/dns-json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolveTXT', () => {
  it('Cloudflare DoH の JSON から TXT 文字列一覧を取り出す', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        Status: 0,
        Answer: [
          { name: NAME, type: 16, data: '"v=DKIP1; k=ed25519; p=AAA"' },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await resolveTXT(NAME);
    expect(result.records).toEqual(['v=DKIP1; k=ed25519; p=AAA']);
    expect(result.resolver).toBe('cloudflare');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('cloudflare-dns.com/dns-query');
    expect(String(url)).toContain(`name=${NAME}`);
    expect(init.headers.Accept).toBe('application/dns-json');
  });

  it('Cloudflare が失敗したら Google にフォールバックする', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(
        jsonResponse({
          Status: 0,
          Answer: [{ name: NAME, type: 16, data: 'v=DKIP1; p=BBB' }],
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await resolveTXT(NAME);
    expect(result.records).toEqual(['v=DKIP1; p=BBB']);
    expect(result.resolver).toBe('google');
    expect(String(fetchMock.mock.calls[1][0])).toContain('dns.google/resolve');
  });

  it('255 文字分割 TXT（"..." "..."）を結合する', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        Status: 0,
        Answer: [{ name: NAME, type: 16, data: '"v=DKIP1; k=ed" "25519; p=CCC"' }],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await resolveTXT(NAME);
    expect(result.records).toEqual(['v=DKIP1; k=ed25519; p=CCC']);
  });

  it('Answer が無い（NXDOMAIN 等）なら空配列を返す', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ Status: 3 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await resolveTXT(NAME);
    expect(result.records).toEqual([]);
  });

  it('両系統とも失敗したら例外を投げる', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('down'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveTXT(NAME)).rejects.toThrow();
  });

  it('TXT 以外のレコード型 (type!=16) は無視する', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        Status: 0,
        Answer: [
          { name: NAME, type: 5, data: 'cname.example.com.' },
          { name: NAME, type: 16, data: '"v=DKIP1; p=DDD"' },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await resolveTXT(NAME);
    expect(result.records).toEqual(['v=DKIP1; p=DDD']);
  });
});
