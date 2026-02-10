import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { SkillTemplate, SkillMetadata } from './types.js';
import { formatDate, generateFrontmatter } from './utils.js';

/**
 * Template engine for generating skills from templates
 */
export class TemplateEngine {
  constructor(private templatesDir: string) {}

  /**
   * Get available templates
   */
  async getTemplates(): Promise<SkillTemplate[]> {
    return [
      {
        name: 'api-library',
        sections: [
          'Overview',
          'Installation',
          'Authentication',
          'Basic Usage',
          'Key Features',
          'Advanced Usage',
          'Best Practices',
          'Common Errors',
          'Resources',
        ],
        requiredFields: ['name', 'description', 'version'],
        exampleLanguages: ['python', 'typescript'],
      },
      {
        name: 'framework',
        sections: [
          'Overview',
          'Setup',
          'Core Concepts',
          'Getting Started',
          'Routing',
          'State Management',
          'Best Practices',
          'Common Patterns',
          'Resources',
        ],
        requiredFields: ['name', 'description', 'version'],
        exampleLanguages: ['typescript', 'javascript'],
      },
      {
        name: 'cli-tool',
        sections: [
          'Overview',
          'Installation',
          'Basic Commands',
          'Configuration',
          'Advanced Usage',
          'Scripting',
          'Best Practices',
          'Troubleshooting',
          'Resources',
        ],
        requiredFields: ['name', 'description', 'version'],
        exampleLanguages: ['bash', 'shell'],
      },
      {
        name: 'minimal',
        sections: ['Overview', 'Usage', 'Examples', 'Resources'],
        requiredFields: ['name', 'description'],
        exampleLanguages: [],
      },
    ];
  }

  /**
   * Generate a skill from template
   */
  async generateFromTemplate(
    templateName: string,
    metadata: SkillMetadata,
    content: Partial<Record<string, string>>
  ): Promise<string> {
    const templates = await this.getTemplates();
    const template = templates.find((t) => t.name === templateName);

    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }

    // Generate frontmatter
    const frontmatter = generateFrontmatter({
      name: metadata.name,
      description: metadata.description,
      version: metadata.version || '1.0.0',
      sources_verified: metadata.sources_verified || formatDate(),
      ...(metadata.tags && { tags: metadata.tags }),
    });

    // Generate sections
    const sections: string[] = [];

    for (const sectionName of template.sections) {
      const sectionContent = content[sectionName.toLowerCase().replace(/\s+/g, '_')];
      
      if (sectionContent) {
        sections.push(`## ${sectionName}\n\n${sectionContent}`);
      } else {
        sections.push(`## ${sectionName}\n\n<!-- TODO: Add ${sectionName} content -->`);
      }
    }

    return `${frontmatter}\n\n# ${metadata.name}\n\n${metadata.description}\n\n${sections.join('\n\n')}`;
  }

  /**
   * Create a new skill from scratch with template
   */
  async createSkillFromTemplate(
    templateName: string,
    skillData: {
      name: string;
      description: string;
      tags?: string[];
      content?: Partial<Record<string, string>>;
    }
  ): Promise<string> {
    const metadata: SkillMetadata = {
      name: skillData.name,
      description: skillData.description,
      version: '1.0.0',
      sources_verified: formatDate(),
      tags: skillData.tags,
    };

    return this.generateFromTemplate(templateName, metadata, skillData.content || {});
  }

  /**
   * Generate API library skill template
   */
  async generateAPITemplate(
    name: string,
    description: string,
    options: {
      pythonPackage?: string;
      npmPackage?: string;
      hasAuth?: boolean;
      officialDocs?: string;
    }
  ): Promise<string> {
    const content: Partial<Record<string, string>> = {
      overview: description,
      installation: this.generateInstallationSection(options.pythonPackage, options.npmPackage),
      authentication: options.hasAuth
        ? this.generateAuthSection()
        : 'No authentication required.',
      basic_usage: this.generateBasicUsageSection(options.pythonPackage, options.npmPackage),
      resources: options.officialDocs
        ? `- [Official Documentation](${options.officialDocs})`
        : '<!-- Add official documentation links -->',
    };

    return this.createSkillFromTemplate('api-library', {
      name,
      description,
      tags: ['api', 'library'],
      content,
    });
  }

  // Private helpers

  private generateInstallationSection(pythonPackage?: string, npmPackage?: string): string {
    const sections: string[] = [];

    if (pythonPackage) {
      sections.push(`### Python\n\n\`\`\`bash\npip install ${pythonPackage}\n\`\`\``);
    }

    if (npmPackage) {
      sections.push(
        `### JavaScript/TypeScript\n\n\`\`\`bash\nnpm install ${npmPackage}\n# or\nbun add ${npmPackage}\n\`\`\``
      );
    }

    return sections.join('\n\n') || '<!-- Add installation instructions -->';
  }

  private generateAuthSection(): string {
    return `### Getting API Keys

1. Visit the service dashboard
2. Create an account or sign in
3. Navigate to API keys section
4. Generate a new key

### Configuration

\`\`\`python
import os

# Recommended: Use environment variables
api_key = os.environ.get("API_KEY")
\`\`\`

\`\`\`typescript
// Environment variable (recommended)
const apiKey = process.env.API_KEY;
\`\`\``;
  }

  private generateBasicUsageSection(pythonPackage?: string, npmPackage?: string): string {
    const sections: string[] = [];

    if (pythonPackage) {
      sections.push(`### Python

\`\`\`python
"""
Basic usage example
"""
from ${pythonPackage} import Client

try:
    client = Client(api_key=os.environ.get("API_KEY"))
    response = client.method()
    print(response)
except Exception as e:
    print(f"Error: {e}")
\`\`\``);
    }

    if (npmPackage) {
      sections.push(`### TypeScript

\`\`\`typescript
import { Client } from '${npmPackage}';

const client = new Client({
  apiKey: process.env.API_KEY
});

async function main() {
  try {
    const response = await client.method();
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
\`\`\``);
    }

    return sections.join('\n\n') || '<!-- Add usage examples -->';
  }
}
