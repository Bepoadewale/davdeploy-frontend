import axe from 'axe-core';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AboutPage from './AboutPage';
import HomePage from './HomePage';
import TeamPage from './TeamPage';

describe('public company information pages', () => {
  it('adds subtle Team and About Us links to the existing homepage footer', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const footer = screen.getByRole('contentinfo', { name: /public site navigation/i });
    expect(within(footer).getByRole('link', { name: 'Team' })).toHaveAttribute('href', '/team');
    expect(within(footer).getByRole('link', { name: 'About Us' })).toHaveAttribute(
      'href',
      '/about',
    );
    expect(within(footer).getByRole('link', { name: 'Contact Us' })).toHaveAttribute(
      'href',
      'mailto:support@davdeploy.tech',
    );
    expect(within(footer).getByRole('link', { name: 'Workspace sign in' })).toHaveAttribute(
      'href',
      '/overview',
    );
  });

  it('presents the solo founder accurately with the approved portrait', async () => {
    const { container } = render(
      <MemoryRouter>
        <TeamPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /meet the founder/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Adewale Ayeni-Bepo' })).toBeInTheDocument();
    expect(screen.getByText('Founder, DavDeploy')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'bepoadewale@davdeploy.tech' })).toHaveAttribute(
      'href',
      'mailto:bepoadewale@davdeploy.tech',
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/adewale-ayeni-bepo/',
    );
    expect(screen.queryByText(/founded october 2026 · nigeria/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /adewale ayeni-bepo, founder of davdeploy/i }),
    ).toHaveAttribute('src', '/images/adewale-ayeni-bepo.jpeg');
    expect(document.title).toBe('Team | DavDeploy');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Meet Adewale Ayeni-Bepo, founder of DavDeploy, an evidence-led cloud infrastructure platform.',
    );
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://davdeploy.tech/team',
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://davdeploy.tech/team',
    );
    const result = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    });
    expect(result.violations).toEqual([]);
  });

  it('keeps AWS current and names every other cloud as future work', async () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /clearer infrastructure choices/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /AWS planning, review, and account discovery are the implemented cloud path/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/customer workload deployment is a controlled pilot capability/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/future integrations may include microsoft azure/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/they are not available today/i)).toBeInTheDocument();
    expect(screen.getByText('Founded in October 2026.')).toBeInTheDocument();
    expect(screen.getByText(/AI proposes. Humans approve./i)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /protected cloud infrastructure with security controls/i }),
    ).toHaveAttribute('src', '/media/davdeploy/security.webp');
    expect(
      screen.queryByRole('link', { name: 'bepoadewale@davdeploy.tech' }),
    ).not.toBeInTheDocument();
    expect(document.title).toBe('About Us | DavDeploy');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Learn how DavDeploy helps teams create simpler, cost-aware cloud infrastructure plans and controlled paths to deployment.',
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
