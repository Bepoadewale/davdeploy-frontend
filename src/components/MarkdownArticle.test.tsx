import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MarkdownArticle from './MarkdownArticle';

describe('MarkdownArticle', () => {
  it('renders headings, emphasis, lists, and GitHub Flavored Markdown tables', () => {
    render(
      <MarkdownArticle
        source={
          '# Overview\n\n**Important**\n\n- First\n- Second\n\n| Name | Value |\n| --- | --- |\n| Region | us-east-1 |'
        }
      />,
    );

    expect(screen.getByRole('heading', { name: 'Overview', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Important').tagName).toBe('STRONG');
    expect(screen.getByText('First').closest('li')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('us-east-1')).toBeInTheDocument();
  });

  it('does not render raw HTML or unsafe link protocols', () => {
    render(
      <MarkdownArticle
        source={'<script>window.compromised = true</script>\n\n[unsafe](javascript:alert(1))'}
      />,
    );

    expect(document.querySelector('script')).not.toBeInTheDocument();
    expect(document.querySelector('[href^="javascript:"]')).not.toBeInTheDocument();
  });
});
