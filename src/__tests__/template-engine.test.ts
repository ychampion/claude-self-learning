import { describe, it, expect } from 'vitest';
import { TemplateEngine } from '../template-engine.js';
import type { SkillMetadata } from '../types.js';

describe('TemplateEngine', () => {
  const engine = new TemplateEngine('/tmp/templates');

  describe('getTemplates', () => {
    it('returns available templates', async () => {
      const templates = await engine.getTemplates();

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some((t) => t.name === 'api-library')).toBe(true);
      expect(templates.some((t) => t.name === 'framework')).toBe(true);
      expect(templates.some((t) => t.name === 'cli-tool')).toBe(true);
      expect(templates.some((t) => t.name === 'minimal')).toBe(true);
    });

    it('templates have required fields', async () => {
      const templates = await engine.getTemplates();

      for (const template of templates) {
        expect(template.name).toBeTruthy();
        expect(Array.isArray(template.sections)).toBe(true);
        expect(Array.isArray(template.requiredFields)).toBe(true);
        expect(Array.isArray(template.exampleLanguages)).toBe(true);
      }
    });
  });

  describe('generateFromTemplate', () => {
    it('generates skill from minimal template', async () => {
      const metadata: SkillMetadata = {
        name: 'Test Skill',
        description: 'A test skill',
        version: '1.0.0',
      };

      const content = {
        overview: 'This is an overview',
        usage: 'Use it like this',
      };

      const skill = await engine.generateFromTemplate('minimal', metadata, content);

      expect(skill).toContain('name: Test Skill');
      expect(skill).toContain('description: A test skill');
      expect(skill).toContain('## Overview');
      expect(skill).toContain('This is an overview');
      expect(skill).toContain('## Usage');
      expect(skill).toContain('Use it like this');
    });

    it('generates API library template', async () => {
      const metadata: SkillMetadata = {
        name: 'Test API',
        description: 'An API wrapper',
        version: '1.0.0',
        tags: ['api'],
      };

      const skill = await engine.generateFromTemplate('api-library', metadata, {});

      expect(skill).toContain('## Installation');
      expect(skill).toContain('## Authentication');
      expect(skill).toContain('## Basic Usage');
      expect(skill).toContain('## Best Practices');
    });

    it('throws error for unknown template', async () => {
      const metadata: SkillMetadata = {
        name: 'Test',
        description: 'Test',
        version: '1.0.0',
      };

      await expect(engine.generateFromTemplate('unknown', metadata, {})).rejects.toThrow(
        'Template "unknown" not found'
      );
    });
  });

  describe('createSkillFromTemplate', () => {
    it('creates a complete skill', async () => {
      const skill = await engine.createSkillFromTemplate('minimal', {
        name: 'My Skill',
        description: 'A great skill',
        tags: ['test', 'example'],
      });

      expect(skill).toContain('name: My Skill');
      expect(skill).toContain('description: A great skill');
      expect(skill).toContain('version: 1.0.0');
      expect(skill).toContain('["test", "example"]');
    });
  });

  describe('generateAPITemplate', () => {
    it('generates API template with Python and TypeScript', async () => {
      const skill = await engine.generateAPITemplate('Test API', 'A test API wrapper', {
        pythonPackage: 'test-api',
        npmPackage: '@test/api',
        hasAuth: true,
        officialDocs: 'https://docs.example.com',
      });

      expect(skill).toContain('pip install test-api');
      expect(skill).toContain('npm install @test/api');
      expect(skill).toContain('## Authentication');
      expect(skill).toContain('https://docs.example.com');
    });

    it('generates API template without auth', async () => {
      const skill = await engine.generateAPITemplate('Test Library', 'A library', {
        pythonPackage: 'test-lib',
        hasAuth: false,
      });

      expect(skill).toContain('pip install test-lib');
      expect(skill).toContain('No authentication required');
    });

    it('includes error handling in examples', async () => {
      const skill = await engine.generateAPITemplate('Test API', 'An API', {
        pythonPackage: 'test-api',
        npmPackage: '@test/api',
        hasAuth: true,
      });

      expect(skill).toContain('try:');
      expect(skill).toContain('except');
      expect(skill).toContain('try {');
      expect(skill).toContain('catch');
    });
  });
});
