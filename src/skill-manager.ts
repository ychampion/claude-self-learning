import { readFile, writeFile, mkdir, access, stat } from 'fs/promises';
import { join, dirname } from 'path';
import fg from 'fast-glob';
import { SkillLocation } from './types.js';
import type { Skill, SkillMetadata, PluginConfig, CodeBlock, SkillIndex } from './types.js';
import { SkillMetadataSchema } from './types.js';
import {
  slugify,
  parseFrontmatter,
  generateFrontmatter,
  daysSince,
  formatDate,
  incrementVersion,
  safeParseJSON,
  extractCodeBlocks,
  calculateQualityScore,
  fuzzyMatch,
} from './utils.js';

/**
 * Advanced skill manager with local-first features
 * - Smart indexing for instant search
 * - Quality scoring
 * - Code block extraction
 * - Dependency tracking
 */
export class SkillManager {
  private index: Map<string, SkillIndex> = new Map();
  private indexLoaded = false;

  constructor(private config: PluginConfig) {}

  /**
   * Initialize the skill manager and load index
   */
  async initialize(): Promise<void> {
    if (this.indexLoaded) return;
    
    await this.loadIndex();
    
    if (this.config.features.autoIndex) {
      await this.rebuildIndex();
    }
    
    this.indexLoaded = true;
  }

  /**
   * Find a skill by topic (using index for fast lookup)
   */
  async findSkill(topic: string): Promise<Skill | null> {
    await this.initialize();
    
    const slug = slugify(topic);
    const indexEntry = this.index.get(slug);
    
    if (indexEntry) {
      return this.loadSkill(indexEntry.path, indexEntry.location);
    }

    // Fallback: search file system
    const locations = [
      { type: SkillLocation.LOCAL, path: this.config.skillsDir.local },
      { type: SkillLocation.GLOBAL, path: this.config.skillsDir.global },
      { type: SkillLocation.PLUGIN, path: this.config.skillsDir.plugin },
    ];

    for (const location of locations) {
      const skillPath = join(location.path, slug, 'SKILL.md');
      const skill = await this.loadSkill(skillPath, location.type);
      if (skill) return skill;
    }

    return null;
  }

  /**
   * Search skills by query (fuzzy matching)
   */
  async searchSkills(query: string, limit = 10): Promise<Skill[]> {
    await this.initialize();
    
    const results: Array<{ skill: SkillIndex; score: number }> = [];
    
    for (const indexEntry of this.index.values()) {
      const nameScore = fuzzyMatch(indexEntry.name, query);
      const descScore = fuzzyMatch(indexEntry.description, query);
      const tagsScore = Math.max(...indexEntry.tags.map(tag => fuzzyMatch(tag, query)), 0);
      
      const totalScore = Math.max(nameScore, descScore, tagsScore);
      
      if (totalScore > 50) {
        results.push({ skill: indexEntry, score: totalScore });
      }
    }
    
    results.sort((a, b) => b.score - a.score);
    
    const skills: Skill[] = [];
    for (const result of results.slice(0, limit)) {
      const skill = await this.loadSkill(result.skill.path, result.skill.location);
      if (skill) skills.push(skill);
    }
    
    return skills;
  }

  /**
   * List all skills from specified locations
   */
  async listSkills(locations?: SkillLocation[]): Promise<Skill[]> {
    await this.initialize();
    
    const searchLocations = locations || [
      SkillLocation.LOCAL,
      SkillLocation.GLOBAL,
      SkillLocation.PLUGIN,
    ];

    const skills: Skill[] = [];

    for (const locationType of searchLocations) {
      const basePath = this.getLocationPath(locationType);
      const pattern = join(basePath, '*/SKILL.md');

      try {
        const files = await fg(pattern, { absolute: true });

        for (const file of files) {
          const skill = await this.loadSkill(file, locationType);
          if (skill) skills.push(skill);
        }
      } catch {
        // Directory might not exist
      }
    }

    // Sort by quality score
    skills.sort((a, b) => (b.metadata.quality_score || 0) - (a.metadata.quality_score || 0));

    return skills;
  }

  /**
   * Save a skill to a specific location
   */
  async saveSkill(
    topic: string,
    content: string,
    metadata: SkillMetadata,
    location: SkillLocation
  ): Promise<string> {
    const slug = slugify(topic);
    const basePath = this.getLocationPath(location);
    const skillDir = join(basePath, slug);
    const skillPath = join(skillDir, 'SKILL.md');
    const metaPath = join(skillDir, '.meta.json');

    // Create directory
    await mkdir(skillDir, { recursive: true });

    // Calculate quality score
    const qualityScore = this.config.features.qualityCheck 
      ? calculateQualityScore(content, metadata as Record<string, unknown>)
      : undefined;

    // Prepare frontmatter
    const frontmatter = generateFrontmatter({
      name: metadata.name,
      description: metadata.description,
      version: metadata.version,
      sources_verified: metadata.sources_verified || formatDate(),
      ...(metadata.tags && { tags: metadata.tags }),
    });

    // Save skill
    await writeFile(skillPath, frontmatter + '\n\n' + content, 'utf-8');

    // Save metadata
    const meta: SkillMetadata = {
      ...metadata,
      created: metadata.created || formatDate(),
      updated: formatDate(),
      topic,
      quality_score: qualityScore,
      usage_count: metadata.usage_count || 0,
    };
    await writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

    // Update index
    await this.addToIndex({
      name: metadata.name,
      slug,
      description: metadata.description,
      tags: metadata.tags || [],
      location,
      path: skillPath,
      qualityScore: qualityScore || 0,
      lastModified: Date.now(),
    });

    return skillPath;
  }

  /**
   * Update an existing skill
   */
  async updateSkill(
    existingSkill: Skill,
    newContent: string,
    changes: string[]
  ): Promise<Skill> {
    const { metadata, path: skillPath } = existingSkill;
    const metaPath = join(dirname(skillPath), '.meta.json');

    // Increment version
    const newVersion = incrementVersion(metadata.version, 'minor');

    // Calculate quality score
    const qualityScore = this.config.features.qualityCheck
      ? calculateQualityScore(newContent, metadata as Record<string, unknown>)
      : metadata.quality_score;

    // Update metadata
    const updatedMetadata: SkillMetadata = {
      ...metadata,
      version: newVersion,
      sources_verified: formatDate(),
      updated: formatDate(),
      quality_score: qualityScore,
      changelog: [
        ...(metadata.changelog || []),
        {
          version: newVersion,
          date: formatDate(),
          changes,
        },
      ],
    };

    // Prepare frontmatter
    const frontmatter = generateFrontmatter({
      name: updatedMetadata.name,
      description: updatedMetadata.description,
      version: updatedMetadata.version,
      sources_verified: updatedMetadata.sources_verified!,
      ...(updatedMetadata.tags && { tags: updatedMetadata.tags }),
    });

    // Save updated skill
    await writeFile(skillPath, frontmatter + '\n\n' + newContent, 'utf-8');
    await writeFile(metaPath, JSON.stringify(updatedMetadata, null, 2), 'utf-8');

    // Update index
    const slug = slugify(updatedMetadata.topic || updatedMetadata.name);
    await this.addToIndex({
      name: updatedMetadata.name,
      slug,
      description: updatedMetadata.description,
      tags: updatedMetadata.tags || [],
      location: existingSkill.location,
      path: skillPath,
      qualityScore: qualityScore || 0,
      lastModified: Date.now(),
    });

    return {
      ...existingSkill,
      content: newContent,
      metadata: updatedMetadata,
    };
  }

  /**
   * Get skill statistics
   */
  async getStats(): Promise<{
    total: number;
    byLocation: Record<SkillLocation, number>;
    averageQuality: number;
    totalCodeBlocks: number;
    topTags: Array<{ tag: string; count: number }>;
  }> {
    await this.initialize();
    
    const skills = await this.listSkills();
    
    const byLocation: Record<SkillLocation, number> = {
      [SkillLocation.LOCAL]: 0,
      [SkillLocation.GLOBAL]: 0,
      [SkillLocation.PLUGIN]: 0,
    };
    
    let totalQuality = 0;
    let totalCodeBlocks = 0;
    const tagCounts = new Map<string, number>();
    
    for (const skill of skills) {
      byLocation[skill.location]++;
      totalQuality += skill.metadata.quality_score || 0;
      totalCodeBlocks += skill.codeBlocks.length;
      
      for (const tag of skill.metadata.tags || []) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
    
    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      total: skills.length,
      byLocation,
      averageQuality: skills.length > 0 ? totalQuality / skills.length : 0,
      totalCodeBlocks,
      topTags,
    };
  }

  /**
   * Rebuild the skill index
   */
  async rebuildIndex(): Promise<void> {
    this.index.clear();
    
    const skills = await this.listSkills();
    
    for (const skill of skills) {
      const slug = slugify(skill.metadata.topic || skill.metadata.name);
      await this.addToIndex({
        name: skill.metadata.name,
        slug,
        description: skill.metadata.description,
        tags: skill.metadata.tags || [],
        location: skill.location,
        path: skill.path,
        qualityScore: skill.metadata.quality_score || 0,
        lastModified: Date.now(),
      });
    }
    
    await this.saveIndex();
  }

  // Private helpers

  private getLocationPath(location: SkillLocation): string {
    switch (location) {
      case SkillLocation.LOCAL:
        return this.config.skillsDir.local;
      case SkillLocation.GLOBAL:
        return this.config.skillsDir.global;
      case SkillLocation.PLUGIN:
        return this.config.skillsDir.plugin;
    }
  }

  private async loadSkill(path: string, location: SkillLocation): Promise<Skill | null> {
    try {
      await access(path);
      const content = await readFile(path, 'utf-8');
      const stats = await stat(path);
      const { frontmatter, body } = parseFrontmatter(content);

      // Load metadata from .meta.json if exists
      const metaPath = join(dirname(path), '.meta.json');
      let metaData: Partial<SkillMetadata> = {};
      try {
        const metaContent = await readFile(metaPath, 'utf-8');
        metaData = safeParseJSON(metaContent, {});
      } catch {
        // .meta.json doesn't exist
      }

      // Merge frontmatter and metadata
      const metadata = {
        ...metaData,
        ...frontmatter,
      };

      // Validate metadata
      const validatedMetadata = SkillMetadataSchema.parse(metadata);

      const daysStale = validatedMetadata.sources_verified 
        ? daysSince(validatedMetadata.sources_verified)
        : undefined;

      // Extract code blocks
      const codeBlocks: CodeBlock[] = extractCodeBlocks(body).map(block => ({
        ...block,
        hasTests: /test|describe|it\(|expect/.test(block.code),
      }));

      return {
        metadata: validatedMetadata,
        content: body,
        location,
        path,
        daysStale,
        size: stats.size,
        codeBlocks,
      };
    } catch {
      return null;
    }
  }

  private async loadIndex(): Promise<void> {
    try {
      await access(this.config.indexPath);
      const indexData = await readFile(this.config.indexPath, 'utf-8');
      const entries: SkillIndex[] = safeParseJSON(indexData, []);
      
      for (const entry of entries) {
        this.index.set(entry.slug, entry);
      }
    } catch {
      // Index doesn't exist yet
    }
  }

  private async saveIndex(): Promise<void> {
    const entries = Array.from(this.index.values());
    const indexDir = dirname(this.config.indexPath);
    
    await mkdir(indexDir, { recursive: true });
    await writeFile(this.config.indexPath, JSON.stringify(entries, null, 2), 'utf-8');
  }

  private async addToIndex(entry: SkillIndex): Promise<void> {
    this.index.set(entry.slug, entry);
    await this.saveIndex();
  }
}
