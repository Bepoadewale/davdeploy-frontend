import axe from 'axe-core';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import HomePage from './HomePage';

describe('public product overview', () => {
  it('states the product outcome and labels the illustrative decision truthfully', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'DavDeploy' })).toBeInTheDocument();
    expect(screen.queryByText('Write what you need. We build the path.')).not.toBeInTheDocument();
    expect(
      screen.getByRole('figure', { name: /illustrative davdeploy decision brief/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Recommended approach')).toBeInTheDocument();
    expect(screen.getByText('Four clear steps')).toBeInTheDocument();
    expect(screen.getByText(/governed infrastructure for every cloud/i)).toBeInTheDocument();
    expect(screen.getByText(/deploy, across any cloud/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /founders and product teams making cloud decisions/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Customer-cloud')).toBeInTheDocument();
    expect(screen.getByText('Multi-cloud')).toBeInTheDocument();
    expect(screen.getByText(/choose your cloud, then start in the browser/i)).toBeInTheDocument();
    expect(screen.queryByText(/AWS/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/customers trust/i)).not.toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: /open workspace/i })) {
      expect(link).toHaveAttribute('href', '/overview');
    }
    expect(screen.queryByRole('link', { name: /see the product/i })).not.toBeInTheDocument();
    expect(screen.getByText('Cost is more than compute.')).toBeInTheDocument();
    expect(screen.getByText('AI proposes. Humans approve.')).toBeInTheDocument();
    expect(screen.getByText('Your application stays in your account.')).toBeInTheDocument();
    expect(screen.getByText(/approval records a decision/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /pause architecture illustration/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('video source')).toHaveAttribute(
      'src',
      '/media/davdeploy/hero-idea-to-architecture.mp4',
    );
  });

  it('has no automatically detectable WCAG 2.2 A/AA violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const result = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    });
    expect(result.violations).toEqual([]);
  }, 15_000);
});
