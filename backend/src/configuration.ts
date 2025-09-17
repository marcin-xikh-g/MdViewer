import { existsSync, readFileSync } from 'fs';
import path from 'path';

export const CONFIG_FILE_NAME = 'mdviewer.config.json';

export interface StyleAdjustOptions {
  accentColor?: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  baseFontFamily?: string;
  codeBlockBackground?: string;
  codeBlockText?: string;
  containerMaxWidth?: string | number;
  customCss?: string;
}

export interface MdViewerConfig {
  style?: StyleAdjustOptions;
}

export interface LoadedConfiguration {
  config: MdViewerConfig;
  path?: string;
}

export interface LoadConfigurationOptions {
  explicitPath?: string;
  additionalSearchDirectories?: string[];
}

const defaultConfig: MdViewerConfig = {
  style: {}
};

export function loadConfiguration(options: LoadConfigurationOptions = {}): LoadedConfiguration {
  const searchCandidates = buildSearchCandidates(options);

  for (const candidate of searchCandidates) {
    if (!candidate) {
      continue;
    }

    if (!existsSync(candidate)) {
      continue;
    }

    const raw = readFileSync(candidate, 'utf8');
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(`Unable to parse configuration at ${candidate}: ${(error as Error).message}`);
    }

    const config = mergeConfiguration(parsed);
    return { config, path: candidate };
  }

  return { config: cloneConfig(defaultConfig) };
}

function buildSearchCandidates(options: LoadConfigurationOptions): string[] {
  const candidates: string[] = [];

  if (options.explicitPath) {
    candidates.push(path.resolve(options.explicitPath));
  }

  const executableDir = path.dirname(process.execPath);
  candidates.push(path.join(executableDir, CONFIG_FILE_NAME));

  if (options.additionalSearchDirectories) {
    for (const directory of options.additionalSearchDirectories) {
      candidates.push(path.join(directory, CONFIG_FILE_NAME));
    }
  }

  if (process.argv[1]) {
    const scriptDir = path.dirname(path.resolve(process.argv[1]));
    candidates.push(path.join(scriptDir, CONFIG_FILE_NAME));
  }

  candidates.push(path.join(process.cwd(), CONFIG_FILE_NAME));

  return deduplicate(candidates);
}

function deduplicate(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }
  return result;
}

function mergeConfiguration(raw: unknown): MdViewerConfig {
  if (!isRecord(raw)) {
    throw new Error('Configuration root must be an object.');
  }

  const style = raw.style !== undefined ? normalizeStyle(raw.style) : undefined;
  const merged: MdViewerConfig = cloneConfig(defaultConfig);

  if (style) {
    merged.style = { ...style };
  }

  return merged;
}

function normalizeStyle(raw: unknown): StyleAdjustOptions {
  if (!isRecord(raw)) {
    throw new Error('The "style" section must be an object.');
  }

  const style: StyleAdjustOptions = {};

  assignStringIfPresent(style, 'accentColor', raw.accentColor);
  assignStringIfPresent(style, 'backgroundColor', raw.backgroundColor);
  assignStringIfPresent(style, 'backgroundGradient', raw.backgroundGradient);
  assignStringIfPresent(style, 'baseFontFamily', raw.baseFontFamily);
  assignStringIfPresent(style, 'codeBlockBackground', raw.codeBlockBackground);
  assignStringIfPresent(style, 'codeBlockText', raw.codeBlockText);
  assignWidth(style, raw.containerMaxWidth);
  assignStringIfPresent(style, 'customCss', raw.customCss);

  return style;
}

function assignStringIfPresent(target: StyleAdjustOptions, key: keyof StyleAdjustOptions, value: unknown): void {
  if (typeof value === 'string' && value.trim().length > 0) {
    target[key] = value;
  }
}

function assignWidth(target: StyleAdjustOptions, value: unknown): void {
  if (typeof value === 'number' && Number.isFinite(value)) {
    target.containerMaxWidth = `${value}px`;
    return;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    target.containerMaxWidth = value;
  }
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}

function cloneConfig(config: MdViewerConfig): MdViewerConfig {
  return {
    style: config.style ? { ...config.style } : undefined
  };
}
