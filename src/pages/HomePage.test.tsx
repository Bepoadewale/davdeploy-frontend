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
      screen.getByRole('heading', { name: /write what you need. we build the path/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('figure', { name: /illustrative davdeploy decision brief/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Recommended approach')).toBeInTheDocument();
    expect(screen.getByText('Four clear steps')).toBeInTheDocument();
    expect(screen.getByText(/governed infrastructure for your cloud/i)).toBeInTheDocument();
    expect(screen.getByText(/describe your product in natural language/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /founders and product teams making cloud decisions/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Customer-cloud')).toBeInTheDocument();
    expect(screen.getByText(/browser, automate from the command line/i)).toBeInTheDocument();
    expect(screen.queryByText(/AWS/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/customers trust/i)).not.toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: /open workspace/i })) {
      expect(link).toHaveAttribute('href', '/login');
    }
    expect(screen.queryByRole('link', { name: /see the product/i })).not.toBeInTheDocument();
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
