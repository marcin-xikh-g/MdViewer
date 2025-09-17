import { promises as fs } from 'fs';
import path from 'path';
import { MdViewerConfig } from './configuration.js';
import { renderMarkdownToHtml } from './markdownRenderer.js';

export interface ConversionSummary {
  inputPath: string;
  outputPath: string;
  html: string;
}

export interface MarkdownConversionServiceOptions {
  config?: MdViewerConfig;
}

export class MarkdownConversionService {
  private readonly config: MdViewerConfig;

  constructor(options: MarkdownConversionServiceOptions = {}) {
    this.config = cloneConfig(options.config);
  }

  async convertFile(inputPath: string, desiredOutput?: string): Promise<ConversionSummary> {
    const absoluteInput = path.resolve(inputPath);
    const markdown = await fs.readFile(absoluteInput, 'utf8');
    const html = renderMarkdownToHtml(markdown, {
      title: path.basename(absoluteInput, path.extname(absoluteInput)),
      styleAdjustments: this.config.style
    });

    const outputPath = desiredOutput
      ? path.resolve(desiredOutput)
      : deriveHtmlPath(absoluteInput);

    await fs.writeFile(outputPath, html, 'utf8');

    return {
      inputPath: absoluteInput,
      outputPath,
      html
    };
  }
}

function deriveHtmlPath(inputPath: string): string {
  const directory = path.dirname(inputPath);
  const basename = path.basename(inputPath, path.extname(inputPath));
  return path.join(directory, `${basename}.html`);
}

function cloneConfig(config?: MdViewerConfig): MdViewerConfig {
  if (!config) {
    return { style: undefined };
  }

  return {
    style: config.style ? { ...config.style } : undefined
  };
}
