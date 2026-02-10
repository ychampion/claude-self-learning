import { describe, it, expect } from 'vitest';
import { getDefaultConfig, getConfig } from '../config.js';

describe('config', () => {
  describe('getDefaultConfig', () => {
    it('should return default configuration', () => {
      const config = getDefaultConfig();

      expect(config).toBeDefined();
      expect(config.skillsDir).toBeDefined();
      expect(config.skillsDir.local).toBeDefined();
      expect(config.skillsDir.global).toBeDefined();
      expect(config.skillsDir.plugin).toBeDefined();
      expect(config.indexPath).toBeDefined();
      expect(config.templatesDir).toBeDefined();
    });

    it('should have cache configuration', () => {
      const config = getDefaultConfig();

      expect(config.cache).toBeDefined();
      expect(config.cache.enabled).toBe(true);
      expect(config.cache.ttl).toBe(3600);
    });

    it('should have features configuration', () => {
      const config = getDefaultConfig();

      expect(config.features).toBeDefined();
      expect(config.features.autoIndex).toBe(true);
      expect(config.features.qualityCheck).toBe(true);
      expect(config.features.codeValidation).toBe(true);
    });

    it('should use correct paths', () => {
      const config = getDefaultConfig();

      expect(config.skillsDir.local).toContain('.claude');
      expect(config.skillsDir.global).toContain('.claude');
      expect(config.skillsDir.plugin).toContain('storage');
      expect(config.indexPath).toContain('skills-index.json');
      expect(config.templatesDir).toContain('templates');
    });
  });

  describe('getConfig', () => {
    it('should return configuration', () => {
      const config = getConfig();

      expect(config).toBeDefined();
      expect(config.skillsDir).toBeDefined();
    });

    it('should match default config', () => {
      const config = getConfig();
      const defaultConfig = getDefaultConfig();

      expect(config).toEqual(defaultConfig);
    });
  });
});
