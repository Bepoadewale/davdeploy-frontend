import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');

describe('public search metadata', () => {
  it('keeps the initial home metadata accurate and canonical', () => {
    const document = readFileSync(resolve(root, 'index.html'), 'utf8');

    expect(document).toContain('DavDeploy | Cloud decisions built on evidence');
    expect(document).toContain(
      'Plan, approve, deploy, and operate the simplest viable infrastructure in your cloud',
    );
    expect(document).not.toContain('AWS is available now.');
    expect(document).toContain('https://davdeploy.tech/images/davdeploy-og-image-1200x630.jpg');
    expect(document).toContain('property="og:image:width" content="1200"');
    expect(document).toContain('property="og:image:height" content="630"');
    expect(document).toContain('<link rel="icon" href="/favicon.ico" sizes="any"');
    expect(document).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png"');
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

  it('publishes the official browser icon manifest', () => {
    const manifest = readFileSync(resolve(root, 'public/site.webmanifest'), 'utf8');

    expect(manifest).toContain('"name": "DavDeploy"');
    expect(manifest).toContain('"src": "/icons-192.png"');
    expect(manifest).toContain('"src": "/icons-512.png"');
  });
});
