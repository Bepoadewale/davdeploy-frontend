import axe from 'axe-core';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AboutPage from './AboutPage';
import HomePage from './HomePage';

describe('public company information pages', () => {
  it('adds subtle Team and About Us links to the existing homepage footer', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const footer = screen.getByRole('contentinfo', { name: /public site navigation/i });
    expect(within(footer).queryByRole('link', { name: 'Team' })).not.toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'About Us' })).toHaveAttribute(
      'href',
      '/about',
    );
    expect(within(footer).getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    expect(within(footer).getByRole('link', { name: 'Contact Us' })).toHaveAttribute(
      'href',
      'mailto:support@davdeploy.tech',
    );
    expect(within(footer).getByRole('link', { name: 'Workspace sign in' })).toHaveAttribute(
      'href',
      '/overview',
    );
  });

  it('describes AWS as the only supported provider and avoids personal founder details', async () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /clearer infrastructure choices/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /AWS is the supported cloud provider/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/customer workload deployment is a controlled pilot capability/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/other cloud providers cannot be connected today/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Founded in October 2026.')).toBeInTheDocument();
    expect(screen.getByText(/AI proposes. Humans approve./i)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /protected cloud infrastructure with security controls/i }),
    ).toHaveAttribute('src', '/media/davdeploy/security.webp');
    expect(
      container.querySelector('source[src="/media/davdeploy/about-complexity-to-clarity.mp4"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('img[src="/media/davdeploy/about-complexity-to-clarity-poster.jpg"]'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'bepoadewale@davdeploy.tech' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Adewale Ayeni-Bepo/i)).not.toBeInTheDocument();
    expect(document.title).toBe('About Us | DavDeploy');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Learn how DavDeploy helps teams review evidence-based AWS infrastructure plans and trade-offs.',
    );
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://davdeploy.tech/about',
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://davdeploy.tech/about',
    );
    const result = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    });
    expect(result.violations).toEqual([]);
  });
});
