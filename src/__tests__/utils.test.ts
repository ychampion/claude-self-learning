import { describe, it, expect } from 'vitest';
import {
  slugify,
  parseFrontmatter,
  generateFrontmatter,
  formatDate,
  incrementVersion,
  extractCodeBlocks,
  calculateQualityScore,
  fuzzyMatch,
} from '../utils.js';

describe('Utils', () => {
  describe('slugify', () => {
    it('converts text to kebab-case', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Anthropic API')).toBe('anthropic-api');
      expect(slugify('Next.js Framework')).toBe('nextjs-framework');
    });

    it('removes special characters', () => {
      expect(slugify('Test@#$%')).toBe('test');
      expect(slugify('Hello!!! World???')).toBe('hello-world');
    });

    it('handles multiple spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world');
    });
  });

  describe('parseFrontmatter', () => {
    it('parses frontmatter correctly', () => {
      const markdown = `---
name: test-skill
description: A test skill
version: 1.0.0
---

# Content

Body text here.`;

      const { frontmatter, body } = parseFrontmatter(markdown);

      expect(frontmatter.name).toBe('test-skill');
      expect(frontmatter.description).toBe('A test skill');
      expect(frontmatter.version).toBe('1.0.0');
      expect(body.trim()).toContain('# Content');
    });

    it('handles arrays in frontmatter', () => {
      const markdown = `---
name: test
tags: ["api", "library"]
---

Content`;

      const { frontmatter } = parseFrontmatter(markdown);
      expect(Array.isArray(frontmatter.tags)).toBe(true);
      expect(frontmatter.tags).toEqual(['api', 'library']);
    });

    it('returns empty frontmatter for content without it', () => {
      const markdown = '# Just content\n\nNo frontmatter here.';
      const { frontmatter, body } = parseFrontmatter(markdown);

      expect(Object.keys(frontmatter).length).toBe(0);
      expect(body).toBe(markdown);
    });
  });

  describe('generateFrontmatter', () => {
    it('generates valid frontmatter', () => {
      const data = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'Test',
      };

      const frontmatter = generateFrontmatter(data);

      expect(frontmatter).toContain('name: test-skill');
      expect(frontmatter).toContain('version: 1.0.0');
      expect(frontmatter).toMatch(/^---\n/);
      expect(frontmatter).toMatch(/\n---$/);
    });

    it('handles arrays', () => {
      const data = {
        tags: ['api', 'library'],
      };

      const frontmatter = generateFrontmatter(data);
      expect(frontmatter).toContain('["api", "library"]');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-02-10');
      const formatted = formatDate(date);

      expect(formatted).toBe('2024-02-10');
    });
  });

  describe('incrementVersion', () => {
    it('increments patch version', () => {
      expect(incrementVersion('1.0.0', 'patch')).toBe('1.0.1');
      expect(incrementVersion('1.2.3', 'patch')).toBe('1.2.4');
    });

    it('increments minor version', () => {
      expect(incrementVersion('1.0.0', 'minor')).toBe('1.1.0');
      expect(incrementVersion('1.2.3', 'minor')).toBe('1.3.0');
    });

    it('increments major version', () => {
      expect(incrementVersion('1.0.0', 'major')).toBe('2.0.0');
      expect(incrementVersion('1.2.3', 'major')).toBe('2.0.0');
    });

    it('handles invalid version', () => {
      expect(incrementVersion('invalid', 'patch')).toBe('1.0.0');
    });
  });

  describe('extractCodeBlocks', () => {
    it('extracts code blocks from markdown', () => {
      const markdown = `
# Title

\`\`\`python
print("Hello")
\`\`\`

Some text

\`\`\`javascript
console.log("World");
\`\`\`
`;

      const blocks = extractCodeBlocks(markdown);

      expect(blocks).toHaveLength(2);
      expect(blocks[0]?.language).toBe('python');
      expect(blocks[0]?.code).toContain('print("Hello")');
      expect(blocks[1]?.language).toBe('javascript');
      expect(blocks[1]?.code).toContain('console.log("World")');
    });

    it('handles code blocks without language', () => {
      const markdown = '```\ncode\n```';
      const blocks = extractCodeBlocks(markdown);

      expect(blocks).toHaveLength(1);
      expect(blocks[0]?.language).toBe('text');
    });

    it('returns empty array for no code blocks', () => {
      const markdown = 'Just text, no code';
      const blocks = extractCodeBlocks(markdown);

      expect(blocks).toHaveLength(0);
    });
  });

  describe('calculateQualityScore', () => {
    it('gives high score for well-structured content', () => {
      const content = `
## Installation

Install the package.

\`\`\`python
try:
    import package
except ImportError:
    print("Error")
\`\`\`

## Usage

Use it like this.

## Examples

Here are examples.

## Best Practices

Follow these practices.
`;

      const metadata = {
        description: 'A comprehensive guide for testing',
        version: '1.0.0',
        tags: ['test', 'example'],
      };

      const score = calculateQualityScore(content, metadata);

      expect(score).toBeGreaterThan(60);
    });

    it('gives low score for minimal content', () => {
      const content = 'Very short';
      const metadata = {};

      const score = calculateQualityScore(content, metadata);

      expect(score).toBeLessThan(30);
    });
  });

  describe('fuzzyMatch', () => {
    it('returns 100 for exact match', () => {
      expect(fuzzyMatch('test string', 'test string')).toBe(100);
    });

    it('returns 100 for substring match', () => {
      expect(fuzzyMatch('test string here', 'test string')).toBe(100);
    });

    it('returns partial score for fuzzy match', () => {
      const score = fuzzyMatch('test', 'testing');
      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThan(100);
    });

    it('is case insensitive', () => {
      expect(fuzzyMatch('Test String', 'test string')).toBe(100);
    });
  });
});
