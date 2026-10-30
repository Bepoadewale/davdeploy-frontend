import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WebsiteMedia from './WebsiteMedia';

describe('WebsiteMedia', () => {
  afterEach(() => vi.restoreAllMocks());

  it('uses a poster fallback and does not autoplay when reduced motion is requested', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    });

    const { container } = render(
      <WebsiteMedia
        src="/media/davdeploy/governance-human-approval.mp4"
        poster="/media/davdeploy/governance-human-approval-poster.jpg"
        label="governance illustration"
        priority
      />,
    );

    await waitFor(() => expect(container.querySelector('video')).toHaveAttribute('hidden'));
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/media/davdeploy/governance-human-approval-poster.jpg',
    );
    expect(
      screen.getByRole('button', { name: 'Play governance illustration' }),
    ).toBeInTheDocument();
  });
});
