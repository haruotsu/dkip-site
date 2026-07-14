import { describe, it, expect } from 'vitest';
import { buildPayload } from './payload';

describe('buildPayload', () => {
  it('d|y|t|n を | 区切りで組み立てる（CLI と一致）', () => {
    expect(buildPayload('example.com', '2014', '2026-07-14', '9f3a1c')).toBe(
      'example.com|2014|2026-07-14|9f3a1c',
    );
  });

  it('y=unknown もそのまま埋め込む', () => {
    expect(buildPayload('example.com', 'unknown', '2026-07-14', 'abc123')).toBe(
      'example.com|unknown|2026-07-14|abc123',
    );
  });
});
