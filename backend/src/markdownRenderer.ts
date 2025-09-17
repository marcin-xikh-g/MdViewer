import { StyleAdjustOptions } from './configuration.js';
import { buildHtmlDocument } from './htmlTemplate.js';

export interface RenderOptions {
  title?: string;
  styleAdjustments?: StyleAdjustOptions;
}

interface RenderOutcome {
  html: string;
  detectedTitle?: string;
}

export function renderMarkdownToHtml(source: string, options: RenderOptions = {}): string {
  const { html, detectedTitle } = renderBlocks(source);
  const title = options.title ?? detectedTitle ?? 'Markdown Document';
  return buildHtmlDocument({
    title,
    content: html,
    style: options.styleAdjustments
  });
}

function renderBlocks(markdown: string): RenderOutcome {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const fragments: string[] = [];
  let detectedTitle: string | undefined;
  let index = 0;

  while (index < lines.length) {
    const current = lines[index];
    if (current.trim().length === 0) {
      index += 1;
      continue;
    }

    if (isFence(current)) {
      const { html, nextIndex } = consumeFence(lines, index);
      fragments.push(html);
      index = nextIndex;
      continue;
    }

    const headingMatch = current.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const rawText = headingMatch[2].trim();
      fragments.push(`<h${level}>${renderInline(rawText)}</h${level}>`);
      if (!detectedTitle) {
        detectedTitle = stripInlineFormatting(rawText);
      }
      index += 1;
      continue;
    }

    if (/^([*-])\s+/.test(current)) {
      const { html, nextIndex } = consumeList(lines, index);
      fragments.push(html);
      index = nextIndex;
      continue;
    }

    if (current.startsWith('>')) {
      const { html, nextIndex } = consumeBlockquote(lines, index);
      fragments.push(html);
      index = nextIndex;
      continue;
    }

    if (/^([*_\-]){3,}$/.test(current.trim())) {
      fragments.push('<hr />');
      index += 1;
      continue;
    }

    const { html, nextIndex } = consumeParagraph(lines, index);
    fragments.push(html);
    index = nextIndex;
  }

  return { html: fragments.join('\n'), detectedTitle };
}

function consumeFence(lines: string[], startIndex: number): { html: string; nextIndex: number } {
  const buffer: string[] = [];
  let index = startIndex + 1;
  while (index < lines.length && !isFence(lines[index])) {
    buffer.push(lines[index]);
    index += 1;
  }
  if (index < lines.length && isFence(lines[index])) {
    index += 1;
  }
  const code = buffer.join('\n');
  return {
    html: `<pre><code>${escapeHtml(code)}</code></pre>`,
    nextIndex: index
  };
}

function consumeList(lines: string[], startIndex: number): { html: string; nextIndex: number } {
  const items: string[] = [];
  let index = startIndex;
  while (index < lines.length && /^([*-])\s+/.test(lines[index])) {
    const itemText = lines[index].replace(/^([*-])\s+/, '');
    items.push(`<li>${renderInline(itemText)}</li>`);
    index += 1;
  }
  return {
    html: `<ul>\n${items.join('\n')}\n</ul>`,
    nextIndex: index
  };
}

function consumeBlockquote(lines: string[], startIndex: number): { html: string; nextIndex: number } {
  const collected: string[] = [];
  let index = startIndex;
  while (index < lines.length && lines[index].startsWith('>')) {
    collected.push(lines[index].replace(/^>\s?/, ''));
    index += 1;
  }
  return {
    html: `<blockquote>${renderInline(collected.join(' '))}</blockquote>`,
    nextIndex: index
  };
}

function consumeParagraph(lines: string[], startIndex: number): { html: string; nextIndex: number } {
  const collected: string[] = [];
  let index = startIndex;
  while (
    index < lines.length &&
    lines[index].trim().length > 0 &&
    !isFence(lines[index]) &&
    !/^(#{1,6})\s+/.test(lines[index]) &&
    !/^([*-])\s+/.test(lines[index]) &&
    !lines[index].startsWith('>') &&
    !/^([*_\-]){3,}$/.test(lines[index].trim())
  ) {
    collected.push(lines[index]);
    index += 1;
  }
  return {
    html: `<p>${renderInline(collected.join(' '))}</p>`,
    nextIndex: index
  };
}

function isFence(line: string): boolean {
  return line.trim().startsWith('```');
}

function renderInline(text: string): string {
  const codeSegments: string[] = [];
  let processed = text.replace(/`([^`]+)`/g, (_, segment) => {
    const token = `@@CODE${codeSegments.length}@@`;
    codeSegments.push(segment);
    return token;
  });

  processed = escapeHtml(processed);

  processed = processed.replace(/\[(.+?)\]\((.+?)\)/g, (_, label: string, url: string) => {
    return `<a href="${escapeAttribute(url)}">${label}</a>`;
  });
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/__(.+?)__/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
  processed = processed.replace(/_(.+?)_/g, '<em>$1</em>');

  codeSegments.forEach((segment, index) => {
    const token = `@@CODE${index}@@`;
    processed = processed.replace(token, `<code>${escapeHtml(segment)}</code>`);
  });

  return processed;
}

function stripInlineFormatting(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
