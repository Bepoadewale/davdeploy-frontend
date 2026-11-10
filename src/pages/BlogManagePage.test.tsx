import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BlogManagePage from './BlogManagePage';

const mocks = vi.hoisted(() => {
  const request = vi.fn();
  return { api: { request }, request };
});

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ api: mocks.api }),
}));

function renderManagePage() {
  return render(
    <MemoryRouter initialEntries={['/blog/manage']}>
      <Routes>
        <Route path="/blog/manage" element={<BlogManagePage />} />
        <Route path="/blog" element={<p>Public blog</p>} />
        <Route path="/overview" element={<p>Workspace overview</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('blog author access', () => {
  beforeEach(() => {
    mocks.request
      .mockReset()
      .mockImplementation((path: string) =>
        Promise.resolve(path === '/api/v1/blog/team/posts' ? [] : { can_publish: false }),
      );
  });

  it('shows the editor when the backend confirms author access', async () => {
    mocks.request.mockImplementation((path: string) =>
      Promise.resolve(path === '/api/v1/blog/team/posts' ? [] : { can_publish: true }),
    );

    renderManagePage();

    expect(await screen.findByRole('heading', { name: 'Publish a note' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save post' })).toBeInTheDocument();
    expect(screen.getByLabelText('Article body (Markdown)')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Preview' })).toBeInTheDocument();
  });

  it('previews Markdown headings and formatting as the author types', async () => {
    mocks.request.mockImplementation((path: string) =>
      Promise.resolve(path === '/api/v1/blog/team/posts' ? [] : { can_publish: true }),
    );

    renderManagePage();

    const article = await screen.findByLabelText('Article body (Markdown)');
    fireEvent.change(article, {
      target: { value: '# Overview\n\n## Details\n\n**Bold note**' },
    });

    expect(screen.getByRole('heading', { name: 'Overview', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Details', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Bold note')).toHaveStyle({ fontWeight: 'bold' });
    await waitFor(() => expect(article).toHaveValue('# Overview\n\n## Details\n\n**Bold note**'));
  });

  it('explains the author rule instead of redirecting workspace users without access', async () => {
    mocks.request.mockResolvedValue({ can_publish: false });

    renderManagePage();

    expect(
      await screen.findByRole('heading', { name: 'Blog author access required' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/workspace sign-in is shared with the public blog/i)).toBeVisible();
    expect(screen.getByRole('link', { name: 'View the public blog' })).toHaveAttribute(
      'href',
      '/blog',
    );
    expect(screen.queryByText('Workspace overview')).not.toBeInTheDocument();
  });

  it('shows a retry action when the author-access check fails', async () => {
    let authorAccessCalls = 0;
    mocks.request.mockImplementation((path: string) => {
      if (path === '/api/v1/blog/team/posts') return Promise.resolve([]);
      authorAccessCalls += 1;
      return authorAccessCalls === 1
        ? Promise.reject(new Error('network failure'))
        : Promise.resolve({ can_publish: true });
    });

    renderManagePage();

    const retry = await screen.findByRole('button', { name: 'Try again' });
    expect(
      screen.getByRole('heading', { name: 'Could not verify author access' }),
    ).toBeInTheDocument();
    fireEvent.click(retry);

    expect(await screen.findByRole('heading', { name: 'Publish a note' })).toBeInTheDocument();
  });
});
