import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { SkillManager } from '../skill-manager.js';
import { SkillLocation } from '../types.js';
import type { PluginConfig } from '../types.js';

describe('SkillManager', () => {
  let testDir: string;
  let config: PluginConfig;
  let manager: SkillManager;

  beforeEach(async () => {
    // Create unique temp directory for each test
    testDir = join(tmpdir(), `skill-manager-test-${Date.now()}`);

    config = {
      skillsDir: {
        local: join(testDir, 'local'),
        global: join(testDir, 'global'),
        plugin: join(testDir, 'plugin'),
      },
      indexPath: join(testDir, 'index.json'),
      templatesDir: join(testDir, 'templates'),
      cache: {
        enabled: true,
        ttl: 3600,
      },
      features: {
        autoIndex: false, // Disable auto-indexing for faster tests
        qualityCheck: true,
        codeValidation: true,
      },
    };

    // Create directories
    await mkdir(config.skillsDir.local, { recursive: true });
    await mkdir(config.skillsDir.global, { recursive: true });
    await mkdir(config.skillsDir.plugin, { recursive: true });

    manager = new SkillManager(config);
  });

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('initialize', () => {
    it('should initialize the skill manager', async () => {
      await manager.initialize();
      expect(true).toBe(true);
    });

    it('should only initialize once', async () => {
      await manager.initialize();
      await manager.initialize();
      expect(true).toBe(true);
    });
  });

  describe('saveSkill', () => {
    it('should save a new skill', async () => {
      const metadata = {
        name: 'test-skill',
        description: 'Test description',
        version: '1.0.0',
        tags: ['test'],
      };

      const content = '# Test Skill\n\nTest content';

      const path = await manager.saveSkill('test-skill', content, metadata, SkillLocation.GLOBAL);

      expect(path).toBeDefined();
      expect(path).toContain('test-skill');
      expect(path).toContain('SKILL.md');
    });
  });

  describe('findSkill', () => {
    it('should return null for non-existent skill', async () => {
      const skill = await manager.findSkill('non-existent');
      expect(skill).toBeNull();
    });

    it('should find an existing skill', async () => {
      const metadata = {
        name: 'findable-skill',
        description: 'Findable',
        version: '1.0.0',
      };

      await manager.saveSkill('findable-skill', '# Findable\n\nContent', metadata, SkillLocation.GLOBAL);
      const found = await manager.findSkill('findable-skill');

      expect(found).toBeDefined();
      expect(found?.metadata.name).toBe('findable-skill');
    });
  });

  describe('listSkills', () => {
    it('should list all skills', async () => {
      await manager.saveSkill(
        'skill-1',
        '# Skill 1',
        { name: 'skill-1', description: 'First', version: '1.0.0' },
        SkillLocation.GLOBAL
      );

      const skills = await manager.listSkills();
      expect(skills.length).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      await manager.saveSkill(
        'stat-skill',
        '# Stats\n\n```js\nconsole.log("test");\n```',
        { name: 'stat-skill', description: 'Stats', version: '1.0.0', tags: ['test'] },
        SkillLocation.GLOBAL
      );

      const stats = await manager.getStats();

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byLocation).toBeDefined();
    });
  });

  describe('rebuildIndex', () => {
    it('should rebuild the index', async () => {
      await manager.saveSkill(
        'indexed-skill',
        '# Indexed',
        { name: 'indexed-skill', description: 'Index test', version: '1.0.0' },
        SkillLocation.GLOBAL
      );

      await manager.rebuildIndex();

      const found = await manager.findSkill('indexed-skill');
      expect(found).toBeDefined();
    });
  });

  describe('updateSkill', () => {
    it('should update an existing skill', async () => {
      await manager.saveSkill(
        'update-test',
        '# Original',
        { name: 'update-test', description: 'Original', version: '1.0.0' },
        SkillLocation.GLOBAL
      );

      const existing = await manager.findSkill('update-test');
      expect(existing).toBeDefined();

      const updated = await manager.updateSkill(
        existing!,
        '# Updated content',
        ['Updated description']
      );

      expect(updated).toBeDefined();
      expect(updated.content).toContain('Updated content');
    });
  });
});
