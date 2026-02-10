/**
 * Utility functions for the plugin
 */

/**
 * Convert a topic string to a slug (kebab-case)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse frontmatter from markdown content
 */
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const [, frontmatterStr = '', body = ''] = match;
  const frontmatter: Record<string, unknown> = {};

  frontmatterStr.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: string | string[] = line.slice(colonIndex + 1).trim();
      
      // Handle arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/^["']|["']$/g, ''));
      }
      
      frontmatter[key] = value;
    }
  });

  return { frontmatter, body };
}

/**
 * Generate frontmatter string
 */
export function generateFrontmatter(data: Record<string, unknown>): string {
  const lines = Object.entries(data).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
    }
    return `${key}: ${value}`;
  });
  return `---\n${lines.join('\n')}\n---`;
}

/**
 * Calculate days since a date
 */
export function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * Increment semantic version
 */
export function incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3) return '1.0.0';

  switch (type) {
    case 'major':
      return `${parts[0]! + 1}.0.0`;
    case 'minor':
      return `${parts[0]}.${parts[1]! + 1}.0`;
    case 'patch':
      return `${parts[0]}.${parts[1]}.${parts[2]! + 1}`;
  }
}

/**
 * Safely parse JSON with fallback
 */
export function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/**
 * Extract code blocks from markdown
 */
export function extractCodeBlocks(markdown: string): Array<{
  language: string;
  code: string;
  lineNumber: number;
}> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string; lineNumber: number }> = [];
  
  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const language = match[1] || 'text';
    const code = match[2]!.trim();
    
    // Calculate line number
    const beforeMatch = markdown.slice(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;
    
    blocks.push({ language, code, lineNumber });
  }
  
  return blocks;
}

/**
 * Calculate quality score for a skill
 */
export function calculateQualityScore(content: string, metadata: Record<string, unknown>): number {
  let score = 0;
  
  // Has description (10 points)
  if (metadata.description && String(metadata.description).length > 20) {
    score += 10;
  }
  
  // Has version (5 points)
  if (metadata.version) {
    score += 5;
  }
  
  // Has tags (5 points)
  if (metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
    score += 5;
  }
  
  // Content length (20 points for 1000+ chars)
  const contentLength = content.length;
  if (contentLength > 1000) {
    score += Math.min(20, contentLength / 100);
  }
  
  // Has code examples (30 points)
  const codeBlocks = extractCodeBlocks(content);
  if (codeBlocks.length > 0) {
    score += Math.min(30, codeBlocks.length * 10);
  }
  
  // Has multiple sections (20 points)
  const sections = content.match(/^##\s+/gm) || [];
  if (sections.length > 3) {
    score += Math.min(20, sections.length * 4);
  }
  
  // Has error handling in code (10 points)
  const hasErrorHandling = /try|catch|error|throw/i.test(content);
  if (hasErrorHandling) {
    score += 10;
  }
  
  return Math.min(100, Math.round(score));
}

/**
 * Create a simple in-memory cache
 */
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();

  set(key: string, value: T, ttl: number): void {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Fuzzy search in text
 */
export function fuzzyMatch(text: string, query: string): number {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match
  if (textLower.includes(queryLower)) {
    return 100;
  }
  
  // Calculate character match score
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score++;
      queryIndex++;
    }
  }
  
  return Math.round((score / queryLower.length) * 100);
}
