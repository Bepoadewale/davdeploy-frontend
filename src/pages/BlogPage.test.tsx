import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BlogPage from './BlogPage';

const mocks = vi.hoisted(() => ({ profile: null as unknown, request: vi.fn() }));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    api: { request: mocks.request },
    profile: mocks.profile,
  }),
}));

describe('public blog', () => {
  beforeEach(() => {
    mocks.profile = null;
    mocks.request
      .mockReset()
      .mockImplementation((path: string) =>
        Promise.resolve(path === '/api/v1/blog/posts' ? [] : { can_publish: false }),
      );
  });

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
    expect(mocks.request).not.toHaveBeenCalledWith('/api/v1/blog/author-access', expect.anything());
  });

  it('shows the post editor link only when the API grants author access', async () => {
    mocks.profile = { user: { subject: 'author', role: 'administrator' } };
    mocks.request.mockImplementation((path: string) =>
      Promise.resolve(path === '/api/v1/blog/posts' ? [] : { can_publish: true }),
    );

    render(
      <MemoryRouter>
        <BlogPage />
      </MemoryRouter>,
    );

    const link = await screen.findByRole('link', { name: 'Write a post' });
    expect(link).toHaveAttribute('href', '/blog/manage');
  });

  it('does not expose the post editor link when author access is denied', async () => {
    mocks.profile = { user: { subject: 'customer', role: 'developer' } };

    render(
      <MemoryRouter>
        <BlogPage />
      </MemoryRouter>,
    );

    await screen.findByText(/first davdeploy note is on its way/i);
    expect(screen.queryByRole('link', { name: 'Write a post' })).not.toBeInTheDocument();
  });
});
