import type { QualityCheck, QualityIssue, Skill } from './types.js';
import { extractCodeBlocks } from './utils.js';

/**
 * Quality checker for skills
 * Validates content, structure, and completeness
 */
export class QualityChecker {
  /**
   * Perform comprehensive quality check on a skill
   */
  check(skill: Skill): QualityCheck {
    const issues: QualityIssue[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check metadata completeness
    const metadataIssues = this.checkMetadata(skill);
    issues.push(...metadataIssues);
    score -= metadataIssues.length * 5;

    // Check content structure
    const structureIssues = this.checkStructure(skill.content);
    issues.push(...structureIssues);
    score -= structureIssues.length * 10;

    // Check code blocks
    const codeIssues = this.checkCodeBlocks(skill.codeBlocks);
    issues.push(...codeIssues);
    score -= codeIssues.length * 8;

    // Generate suggestions
    if (skill.codeBlocks.length === 0) {
      suggestions.push('Add code examples to make the skill more practical');
    }
    
    if (!skill.metadata.tags || skill.metadata.tags.length === 0) {
      suggestions.push('Add tags to improve discoverability');
    }
    
    if (skill.content.length < 500) {
      suggestions.push('Consider adding more detailed explanations and examples');
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  /**
   * Check metadata completeness
   */
  private checkMetadata(skill: Skill): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const { metadata } = skill;

    if (!metadata.description || metadata.description.length < 20) {
      issues.push({
        severity: 'warning',
        message: 'Description should be at least 20 characters',
      });
    }

    if (!metadata.version) {
      issues.push({
        severity: 'error',
        message: 'Version is required',
      });
    }

    if (!metadata.tags || metadata.tags.length === 0) {
      issues.push({
        severity: 'info',
        message: 'Consider adding tags for better discoverability',
      });
    }

    return issues;
  }

  /**
   * Check content structure
   */
  private checkStructure(content: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check for sections
    const sections = content.match(/^##\s+(.+)$/gm) || [];
    
    if (sections.length < 3) {
      issues.push({
        severity: 'warning',
        message: 'Skill should have at least 3 sections for better organization',
      });
    }

    // Check for common sections
    const commonSections = ['installation', 'usage', 'example', 'api'];
    const hasCommonSection = commonSections.some(section =>
      content.toLowerCase().includes(`## ${section}`)
    );

    if (!hasCommonSection) {
      issues.push({
        severity: 'info',
        message: 'Consider adding common sections like Installation, Usage, or Examples',
      });
    }

    // Check for links
    const hasLinks = /\[.+\]\(.+\)/.test(content);
    if (!hasLinks) {
      issues.push({
        severity: 'info',
        message: 'Consider adding links to official documentation',
      });
    }

    return issues;
  }

  /**
   * Check code blocks quality
   */
  private checkCodeBlocks(codeBlocks: Array<{ language: string; code: string; hasTests: boolean }>): QualityIssue[] {
    const issues: QualityIssue[] = [];

    for (const block of codeBlocks) {
      // Check if code has error handling
      const hasErrorHandling = /try|catch|except|error|throw/.test(block.code);
      
      if (!hasErrorHandling && block.code.length > 50) {
        issues.push({
          severity: 'warning',
          message: `Code block in ${block.language} lacks error handling`,
          line: block.lineNumber,
        });
      }

      // Check for hardcoded credentials
      const hasHardcodedCreds = /(api[_-]?key|password|secret|token)\s*=\s*["'][^"']+["']/i.test(block.code);
      
      if (hasHardcodedCreds) {
        issues.push({
          severity: 'error',
          message: 'Possible hardcoded credentials detected',
          line: block.lineNumber,
        });
      }

      // Check for imports/requires
      const hasImports = /(import|require|from|using)\s/.test(block.code);
      
      if (!hasImports && block.code.length > 100) {
        issues.push({
          severity: 'info',
          message: 'Consider adding import statements to make code self-contained',
          line: block.lineNumber,
        });
      }
    }

    return issues;
  }
}
