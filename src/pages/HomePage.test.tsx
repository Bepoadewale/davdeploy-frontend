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
    expect(
      screen.getByRole('heading', { name: /cloud decisions, built on evidence/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('figure', { name: /illustrative davdeploy decision brief/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Recommended approach')).toBeInTheDocument();
    expect(screen.getByText(/from intent to running infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/governed infrastructure for your cloud/i)).toBeInTheDocument();
    expect(
      screen.getByText(/plan, approve, and deploy the right infrastructure/i),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /simple cloud architecture/i })).toHaveLength(2);
    expect(
      screen.getByRole('heading', { name: /less second-guessing\. more forward motion/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Technical founders')).toBeInTheDocument();
    expect(screen.getByText('Growing product teams')).toBeInTheDocument();
    expect(screen.getByText('Teams with real stakes')).toBeInTheDocument();
    expect(screen.getByText(/infrastructure stays in your account/i)).toBeInTheDocument();
    expect(screen.queryByText(/AWS/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/customers trust/i)).not.toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: /open workspace/i })) {
      expect(link).toHaveAttribute('href', '/login');
    }
    expect(screen.getByRole('link', { name: /see the product/i })).toHaveAttribute(
      'href',
      '#product',
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
  });
});
