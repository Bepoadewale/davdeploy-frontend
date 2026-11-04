import { Fragment, type ReactNode } from 'react';

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>]+/gi;
const SIMPLE_TRAILING_PUNCTUATION = /[.,!?;:]$/;

function splitTrailingPunctuation(value: string): [string, string] {
  let end = value.length;
  while (end > 0 && SIMPLE_TRAILING_PUNCTUATION.test(value[end - 1])) end -= 1;

  for (const [closing, opening] of [
    [')', '('],
    [']', '['],
    ['}', '{'],
  ]) {
    while (
      end > 0 &&
      value[end - 1] === closing &&
      value.slice(0, end).split(closing).length > value.slice(0, end).split(opening).length
    ) {
      end -= 1;
    }
  }

  return [value.slice(0, end), value.slice(end)];
}

function safeHttpUrl(value: string): string | null {
  const candidate = value.toLowerCase().startsWith('www.') ? `https://${value}` : value;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

export default function LinkifiedText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let linkIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const matchIndex = match.index ?? 0;
    const token = match[0];
    const [urlText, punctuation] = splitTrailingPunctuation(token);
    const href = safeHttpUrl(urlText);

    if (!href) continue;

    nodes.push(text.slice(cursor, matchIndex));
    nodes.push(
      <Fragment key={`link-${linkIndex}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${urlText} (opens in a new tab)`}
        >
          {urlText}
        </a>
        {punctuation}
      </Fragment>,
    );
    cursor = matchIndex + token.length;
    linkIndex += 1;
  }

  nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
