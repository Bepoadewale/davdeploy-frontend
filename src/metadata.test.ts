import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');

describe('public search metadata', () => {
  it('keeps the initial home metadata accurate and canonical', () => {
    const document = readFileSync(resolve(root, 'index.html'), 'utf8');

    expect(document).toContain('DavDeploy | Evidence-led cloud infrastructure plans');
    expect(document).toContain('AWS is available now.');
    expect(document).toContain('https://davdeploy.tech/images/architecture-convergence.webp');
    expect(document).not.toContain('davdeploy-frontend.pages.dev/images');
  });

  it('publishes only public informational pages in the sitemap', () => {
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf8');

    expect(sitemap).toContain('https://davdeploy.tech/');
    expect(sitemap).toContain('https://davdeploy.tech/team');
    expect(sitemap).toContain('https://davdeploy.tech/about');
    expect(sitemap).not.toContain('/overview');
    expect(robots).toContain('Sitemap: https://davdeploy.tech/sitemap.xml');
  });
});
