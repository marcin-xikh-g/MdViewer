import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { loadConfiguration, CONFIG_FILE_NAME } from '../../backend/dist/configuration.js';

test('loadConfiguration reads explicit file and normalizes values', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mdviewer-config-'));
  const configPath = path.join(directory, CONFIG_FILE_NAME);
  await fs.writeFile(configPath, JSON.stringify({
    style: {
      accentColor: '#123456',
      containerMaxWidth: 820,
      customCss: '.custom { color: red; }'
    }
  }), 'utf8');

  const { config, path: detectedPath } = loadConfiguration({ explicitPath: configPath });

  assert.strictEqual(detectedPath, configPath);
  assert.ok(config.style);
  assert.strictEqual(config.style.accentColor, '#123456');
  assert.strictEqual(config.style.containerMaxWidth, '820px');
  assert.strictEqual(config.style.customCss, '.custom { color: red; }');
});

test('loadConfiguration accepts empty style definitions', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mdviewer-config-empty-'));
  const configPath = path.join(directory, CONFIG_FILE_NAME);
  await fs.writeFile(configPath, JSON.stringify({ style: {} }), 'utf8');

  const { config } = loadConfiguration({ explicitPath: configPath });
  assert.ok(config.style);
  assert.strictEqual(Object.keys(config.style ?? {}).length, 0);
});
