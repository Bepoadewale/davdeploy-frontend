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
    expect(within(footer).getByRole('link', { name: 'Workspace sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('presents the solo founder accurately with a documented portrait fallback', async () => {
    const { container } = render(
      <MemoryRouter>
        <TeamPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /meet the founder/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Adewale Ayeni-Bepo' })).toBeInTheDocument();
    expect(screen.getByText('Founder & CEO, DavDeploy')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'bepoadewale@davdeploy.tech' })).toHaveAttribute(
      'href',
      'mailto:bepoadewale@davdeploy.tech',
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/adewale-ayeni-bepo/',
    );
    expect(screen.getByText(/founded october 2026 · nigeria/i)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /portrait placeholder for adewale/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe('Team | DavDeploy');
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
    expect(screen.getByText(/founded in october 2026 · independently built/i)).toBeInTheDocument();
    expect(screen.getByText(/AI proposes. Humans approve./i)).toBeInTheDocument();
    expect(document.title).toBe('About Us | DavDeploy');
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
