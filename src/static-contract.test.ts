import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('static hosting and responsive contract', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
  const headers = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8');

  it('defines desktop, tablet, mobile, reduced-motion, forced-color, and dark-mode behavior', () => {
    expect(css).toContain('@media (max-width: 1080px)');
    expect(css).toContain('@media (max-width: 840px)');
    expect(css).toContain('@media (max-width: 620px)');
    expect(css).toContain('prefers-reduced-motion');
    expect(css).toContain('forced-colors');
    expect(css).toContain('prefers-color-scheme: dark');
    expect(css).toContain('.execution-stage-label');
    expect(css).toContain('.filter-bar');
  });

  it('ships browser security headers for the Pages static shell', () => {
    expect(headers).toContain('Content-Security-Policy:');
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).not.toMatch(/Durable Object|D1|R2/);
  });

  it('keeps browser-visible source copy free of em dashes', () => {
    const emDash = String.fromCodePoint(0x2014);
    for (const entry of readdirSync(resolve(process.cwd(), 'src'), { recursive: true })) {
      if (typeof entry !== 'string' || !/\.(ts|tsx)$/.test(entry)) continue;
      expect(readFileSync(resolve(process.cwd(), 'src', entry), 'utf8')).not.toContain(emDash);
    }
  });
});
