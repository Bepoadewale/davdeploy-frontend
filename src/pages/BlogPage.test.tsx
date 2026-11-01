import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import BlogPage from './BlogPage';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    api: { request: vi.fn().mockResolvedValue([]) },
  }),
}));

describe('public blog', () => {
  it('keeps the journal readable without sign-in and gives an honest empty state', async () => {
    render(
      <MemoryRouter>
        <BlogPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /notes for clearer cloud decisions/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/first davdeploy note is on its way/i)).toBeInTheDocument();
    expect(document.title).toBe('Blog | DavDeploy');
  });
});
