import { describe, it, expect } from 'vitest';
import { QualityChecker } from '../quality-checker.js';
import type { Skill } from '../types.js';
import { SkillLocation } from '../types.js';

describe('QualityChecker', () => {
  const checker = new QualityChecker();

  const createMockSkill = (overrides: Partial<Skill> = {}): Skill => ({
    metadata: {
      name: 'Test Skill',
      description: 'A test skill for testing',
      version: '1.0.0',
      tags: ['test'],
      ...overrides.metadata,
    },
    content: '## Installation\n\nInstall it.\n\n## Usage\n\nUse it.\n\n## Examples\n\nExamples here.',
    location: SkillLocation.LOCAL,
    path: '/test/path',
    size: 1000,
    codeBlocks: [],
    ...overrides,
  });

  describe('check', () => {
    it('gives high score for quality skill', () => {
      const skill = createMockSkill({
        content: `
## Installation

Install the package

\`\`\`python
try:
    import package
except ImportError as e:
    print(f"Error: {e}")
\`\`\`

## Usage

Use it like this

## Examples

Examples here

## Best Practices

Best practices
`,
        codeBlocks: [
          {
            language: 'python',
            code: 'try:\n    import package\nexcept ImportError as e:\n    print(f"Error: {e}")',
            lineNumber: 5,
            hasTests: false,
          },
        ],
      });

      const result = checker.check(skill);

      expect(result.score).toBeGreaterThan(60);
      expect(result.issues.length).toBeLessThan(5);
    });

    it('detects missing description', () => {
      const skill = createMockSkill({
        metadata: {
          name: 'Test',
          description: 'Short',
          version: '1.0.0',
        },
      });

      const result = checker.check(skill);

      const hasDescriptionIssue = result.issues.some((issue) =>
        issue.message.includes('Description')
      );
      expect(hasDescriptionIssue).toBe(true);
    });

    it('detects missing version', () => {
      const skill = createMockSkill({
        metadata: {
          name: 'Test',
          description: 'A test skill description that is long enough',
          version: '',
        },
      });

      const result = checker.check(skill);

      const hasVersionIssue = result.issues.some((issue) => issue.message.includes('Version'));
      expect(hasVersionIssue).toBe(true);
      expect(result.issues.find((i) => i.message.includes('Version'))?.severity).toBe('error');
    });

    it('detects hardcoded credentials', () => {
      const skill = createMockSkill({
        codeBlocks: [
          {
            language: 'python',
            code: 'api_key = "sk-1234567890abcdef"',
            lineNumber: 10,
            hasTests: false,
          },
        ],
      });

      const result = checker.check(skill);

      const hasCredIssue = result.issues.some((issue) => issue.message.includes('credentials'));
      expect(hasCredIssue).toBe(true);
      expect(result.issues.find((i) => i.message.includes('credentials'))?.severity).toBe('error');
    });

    it('suggests adding code examples', () => {
      const skill = createMockSkill({
        codeBlocks: [],
      });

      const result = checker.check(skill);

      const hasSuggestion = result.suggestions.some((s) => s.includes('code examples'));
      expect(hasSuggestion).toBe(true);
    });

    it('suggests adding tags', () => {
      const skill = createMockSkill({
        metadata: {
          name: 'Test',
          description: 'A test skill',
          version: '1.0.0',
          tags: [],
        },
      });

      const result = checker.check(skill);

      const hasSuggestion =
        result.suggestions.some((s) => s.includes('tags')) ||
        result.issues.some((i) => i.message.includes('tags'));
      expect(hasSuggestion).toBe(true);
    });

    it('checks for missing error handling in code', () => {
      const skill = createMockSkill({
        codeBlocks: [
          {
            language: 'python',
            code: 'def long_function():\n    result = api.call()\n    return result\n\nlong_function()',
            lineNumber: 5,
            hasTests: false,
          },
        ],
      });

      const result = checker.check(skill);

      const hasErrorHandlingIssue = result.issues.some((issue) =>
        issue.message.includes('error handling')
      );
      expect(hasErrorHandlingIssue).toBe(true);
    });
  });
});
