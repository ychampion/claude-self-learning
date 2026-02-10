import { homedir } from 'os';
import { join } from 'path';
import type { PluginConfig } from './types.js';

/**
 * Get default plugin configuration (zero external dependencies)
 */
export function getDefaultConfig(): PluginConfig {
  const home = homedir();
  const pluginRoot = process.cwd();

  return {
    skillsDir: {
      local: join(process.cwd(), '.claude', 'skills'),
      global: join(home, '.claude', 'skills'),
      plugin: join(pluginRoot, 'storage', 'skills'),
    },
    indexPath: join(home, '.claude', 'skills-index.json'),
    templatesDir: join(pluginRoot, 'templates'),
    cache: {
      enabled: true,
      ttl: 3600,
    },
    features: {
      autoIndex: true,
      qualityCheck: true,
      codeValidation: true,
    },
  };
}

export function getConfig(): PluginConfig {
  return getDefaultConfig();
}
