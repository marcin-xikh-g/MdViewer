import { spawn } from 'child_process';
import path from 'path';

export function openFileInBrowser(filePath: string): void {
  const absolute = path.resolve(filePath);
  const platform = process.platform;
  let command: string;
  let args: string[];

  if (platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', quoteIfNeeded(absolute)];
  } else if (platform === 'darwin') {
    command = 'open';
    args = [absolute];
  } else {
    command = 'xdg-open';
    args = [absolute];
  }

  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
      windowsVerbatimArguments: platform === 'win32'
    });
    child.unref();
  } catch (error) {
    throw new Error(`Failed to open browser for ${absolute}: ${(error as Error).message}`);
  }
}

function quoteIfNeeded(value: string): string {
  if (/\s/.test(value)) {
    return `"${value}"`;
  }
  return value;
}
