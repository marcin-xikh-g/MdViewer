#!/usr/bin/env node
import { existsSync, statSync } from 'fs';
import path from 'path';
import { loadConfiguration } from './configuration.js';
import type { LoadedConfiguration } from './configuration.js';
import { MarkdownConversionService } from './fileConversionService.js';
import { openFileInBrowser } from './openInBrowser.js';

interface ParsedArgs {
  inputPath?: string;
  outputPath?: string;
  shouldOpen: boolean;
}

async function main(): Promise<void> {
  const parsed = parseArguments(process.argv.slice(2));

  if (!parsed.inputPath) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const absoluteInput = path.resolve(parsed.inputPath);
  if (!existsSync(absoluteInput) || !statSync(absoluteInput).isFile()) {
    console.error(`Input file not found: ${absoluteInput}`);
    process.exitCode = 2;
    return;
  }

  const loadedConfig = loadConfigWithReporting();
  if (!loadedConfig) {
    return;
  }

  const service = new MarkdownConversionService({ config: loadedConfig.config });

  try {
    const result = await service.convertFile(absoluteInput, parsed.outputPath);
    console.log(`HTML written to ${result.outputPath}`);
    if (parsed.shouldOpen) {
      openFileInBrowser(result.outputPath);
      console.log('Opening HTML in default browser...');
    }
  } catch (error) {
    console.error(`Failed to convert Markdown: ${(error as Error).message}`);
    process.exitCode = 3;
  }
}

function loadConfigWithReporting(): LoadedConfiguration | undefined {
  try {
    const loaded = loadConfiguration();
    if (loaded.path) {
      console.log(`Using configuration from ${loaded.path}`);
    }
    return loaded;
  } catch (error) {
    console.error(`Failed to load configuration: ${(error as Error).message}`);
    process.exitCode = 5;
    return undefined;
  }
}

function parseArguments(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = { shouldOpen: true };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--out' || arg === '-o') {
      const outputCandidate = args[index + 1];
      if (!outputCandidate) {
        throw new Error('Missing value for --out option.');
      }
      parsed.outputPath = outputCandidate;
      index += 1;
    } else if (arg === '--no-open') {
      parsed.shouldOpen = false;
    } else if (!parsed.inputPath) {
      parsed.inputPath = arg;
    } else {
      throw new Error(`Unrecognized argument: ${arg}`);
    }
  }

  return parsed;
}

function printUsage(): void {
  console.log(`Usage: mdviewer <file.md> [--out <file.html>] [--no-open]\n\n` +
    `Examples:\n  mdviewer README.md\n  mdviewer README.md --out output.html --no-open`);
}

main().catch(error => {
  console.error(`Unexpected failure: ${(error as Error).message}`);
  process.exitCode = 4;
});
