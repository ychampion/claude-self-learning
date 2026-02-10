import { describe, it, expect } from 'vitest';
import * as index from '../index.js';

describe('index', () => {
  it('should export SkillManager', () => {
    expect(index.SkillManager).toBeDefined();
  });

  it('should export QualityChecker', () => {
    expect(index.QualityChecker).toBeDefined();
  });

  it('should export TemplateEngine', () => {
    expect(index.TemplateEngine).toBeDefined();
  });

  it('should export getConfig', () => {
    expect(index.getConfig).toBeDefined();
  });

  it('should export types', () => {
    expect(index.SkillLocation).toBeDefined();
  });
});
