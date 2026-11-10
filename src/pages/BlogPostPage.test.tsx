import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BlogPostPage from './BlogPostPage';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ api: { request: mocks.request }, profile: null }),
}));

describe('public blog article Markdown', () => {
  beforeEach(() => {
    mocks.request.mockReset().mockImplementation((path: string) => {
      if (path.endsWith('/comments')) return Promise.resolve([]);
      return Promise.resolve({
        id: 'post-1',
        slug: 'markdown-example',
        title: 'A readable article',
        summary: 'A short summary.',
        body: '# First section\n\n## A subsection\n\n- One item\n- Two items',
        author_name: 'DavDeploy',
        state: 'PUBLISHED',
      });
    });
  });

  it('renders article Markdown under the post title', async () => {
    render(
      <MemoryRouter initialEntries={['/blog/markdown-example']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'A readable article', level: 1 }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: 'First section', level: 2 })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'A subsection', level: 3 })).toBeVisible();
    expect(screen.getByText('One item').closest('li')).toBeVisible();
  });
});
