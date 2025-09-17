import { StyleAdjustOptions } from './configuration.js';

const defaultStyle: ResolvedStyleOptions = {
  accentColor: '#2563eb',
  backgroundColor: '#f4f4f5',
  backgroundGradient: 'radial-gradient(circle at top, #ffffff 0%, #f4f4f5 45%, #e4e4e7 100%)',
  baseFontFamily: `'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
  codeBlockBackground: '#0f172a',
  codeBlockText: '#e2e8f0',
  containerMaxWidth: '960px'
};

export interface HtmlTemplateOptions {
  title: string;
  content: string;
  style?: StyleAdjustOptions;
}

export function buildHtmlDocument({ title, content, style }: HtmlTemplateOptions): string {
  const resolvedStyle = resolveStyle(style);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${composeStyles(resolvedStyle)}</style>
  </head>
  <body>
    <main class="container">
      ${content}
    </main>
  </body>
</html>`;
}

interface ResolvedStyleOptions {
  accentColor: string;
  backgroundColor: string;
  backgroundGradient: string;
  baseFontFamily: string;
  codeBlockBackground: string;
  codeBlockText: string;
  containerMaxWidth: string;
  customCss?: string;
}

function resolveStyle(adjustments?: StyleAdjustOptions): ResolvedStyleOptions {
  if (!adjustments) {
    return { ...defaultStyle, customCss: undefined };
  }

  const customCss = typeof adjustments.customCss === 'string' ? adjustments.customCss.trim() : undefined;

  return {
    accentColor: adjustments.accentColor ?? defaultStyle.accentColor,
    backgroundColor: adjustments.backgroundColor ?? defaultStyle.backgroundColor,
    backgroundGradient: adjustments.backgroundGradient ?? defaultStyle.backgroundGradient,
    baseFontFamily: adjustments.baseFontFamily ?? defaultStyle.baseFontFamily,
    codeBlockBackground: adjustments.codeBlockBackground ?? defaultStyle.codeBlockBackground,
    codeBlockText: adjustments.codeBlockText ?? defaultStyle.codeBlockText,
    containerMaxWidth: normalizeWidth(adjustments.containerMaxWidth) ?? defaultStyle.containerMaxWidth,
    customCss: customCss && customCss.length > 0 ? customCss : undefined
  };
}

function composeStyles(style: ResolvedStyleOptions): string {
  const base = `
    :root {
      color-scheme: light dark;
      font-size: 16px;
      font-family: ${style.baseFontFamily};
      line-height: 1.6;
      background-color: ${style.backgroundColor};
    }
    body {
      margin: 0;
      padding: 2rem 0;
      display: flex;
      justify-content: center;
      background: ${style.backgroundGradient};
    }
    .container {
      max-width: ${style.containerMaxWidth};
      width: calc(100% - 3rem);
      background-color: #ffffff;
      border-radius: 18px;
      box-shadow: 0 18px 35px rgba(15, 23, 42, 0.15);
      padding: 3rem;
      color: #0f172a;
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: 700;
      color: #1e293b;
    }
    pre {
      background-color: ${style.codeBlockBackground};
      color: ${style.codeBlockText};
      padding: 1.25rem;
      border-radius: 14px;
      overflow-x: auto;
    }
    code {
      font-family: 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace;
      background-color: rgba(148, 163, 184, 0.2);
      padding: 0.1rem 0.3rem;
      border-radius: 6px;
    }
    pre code {
      background: none;
      padding: 0;
    }
    a {
      color: ${style.accentColor};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    blockquote {
      border-left: 4px solid #94a3b8;
      padding-left: 1.25rem;
      color: #475569;
      font-style: italic;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    table th, table td {
      border: 1px solid #cbd5f5;
      padding: 0.75rem;
    }
    img {
      max-width: 100%;
    }
    ul {
      padding-left: 1.5rem;
    }
    @media (max-width: 768px) {
      .container {
        padding: 1.75rem;
      }
    }
  `;

  if (!style.customCss) {
    return base;
  }

  return `${base}\n${style.customCss}`;
}

function normalizeWidth(value: string | number | undefined): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}px`;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
