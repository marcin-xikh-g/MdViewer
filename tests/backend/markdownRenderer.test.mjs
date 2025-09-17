import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { renderMarkdownToHtml } from '../../backend/dist/markdownRenderer.js';
import { MarkdownConversionService } from '../../backend/dist/fileConversionService.js';

test('renderMarkdownToHtml renders headings and body', () => {
  const markdown = '# Sample Title\n\nContent paragraph.';
  const html = renderMarkdownToHtml(markdown);
  assert.ok(html.includes('<h1>Sample Title</h1>'));
  assert.ok(html.includes('<p>Content paragraph.</p>'));
  assert.ok(html.includes('<title>Sample Title</title>'));
});

test('renderMarkdownToHtml falls back to generic title', () => {
  const markdown = 'Just text without heading';
  const html = renderMarkdownToHtml(markdown);
  assert.ok(html.includes('<title>Markdown Document</title>'));
});

test('renderMarkdownToHtml applies style adjustments', () => {
  const markdown = '# Heading\n\nBody';
  const html = renderMarkdownToHtml(markdown, {
    styleAdjustments: {
      accentColor: '#ff4500',
      containerMaxWidth: '720px',
      customCss: '.demo { margin: 0; }'
    }
  });

  assert.ok(html.includes('#ff4500'));
  assert.ok(html.includes('max-width: 720px'));
  assert.ok(html.includes('.demo { margin: 0; }'));
});

test('MarkdownConversionService writes HTML next to source file', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mdviewer-test-'));
  const sourcePath = path.join(directory, 'note.md');
  await fs.writeFile(sourcePath, '# Note\n\nTesting.');

  const service = new MarkdownConversionService();
  const summary = await service.convertFile(sourcePath);

  assert.strictEqual(summary.outputPath, path.join(directory, 'note.html'));
  const exists = await fs.stat(summary.outputPath);
  assert.ok(exists.isFile());

  const html = await fs.readFile(summary.outputPath, 'utf8');
  assert.ok(html.includes('<h1>Note</h1>'));
});

test('MarkdownConversionService applies configuration styles', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mdviewer-configured-'));
  const sourcePath = path.join(directory, 'styled.md');
  await fs.writeFile(sourcePath, '# Styled');

  const service = new MarkdownConversionService({
    config: {
      style: {
        accentColor: '#00aa88'
      }
    }
  });

  const summary = await service.convertFile(sourcePath);
  const html = await fs.readFile(summary.outputPath, 'utf8');
  assert.ok(html.includes('#00aa88'));
});
