import { z } from 'zod';

// Skill metadata schema
export const SkillMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string(),
  sources_verified: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  sources: z.array(z.string()).optional(),
  topic: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  quality_score: z.number().min(0).max(100).optional(),
  usage_count: z.number().optional(),
  changelog: z
    .array(
      z.object({
        version: z.string(),
        date: z.string(),
        changes: z.array(z.string()),
      })
    )
    .optional(),
});

export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;

// Skill storage location
export enum SkillLocation {
  LOCAL = 'local',
  GLOBAL = 'global',
  PLUGIN = 'plugin',
}

// Skill with location info
export interface Skill {
  metadata: SkillMetadata;
  content: string;
  location: SkillLocation;
  path: string;
  daysStale?: number;
  size: number;
  codeBlocks: CodeBlock[];
}

// Code block extracted from skill
export interface CodeBlock {
  language: string;
  code: string;
  lineNumber: number;
  hasTests: boolean;
}

// Skill index entry for fast search
export interface SkillIndex {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  location: SkillLocation;
  path: string;
  qualityScore: number;
  lastModified: number;
}

// Template for skill generation
export interface SkillTemplate {
  name: string;
  sections: string[];
  requiredFields: string[];
  exampleLanguages: string[];
}

// Configuration
export interface PluginConfig {
  skillsDir: {
    local: string;
    global: string;
    plugin: string;
  };
  indexPath: string;
  templatesDir: string;
  cache: {
    enabled: boolean;
    ttl: number;
  };
  features: {
    autoIndex: boolean;
    qualityCheck: boolean;
    codeValidation: boolean;
  };
}

// Command result
export interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: Error;
}

// Quality check result
export interface QualityCheck {
  score: number;
  issues: QualityIssue[];
  suggestions: string[];
}

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}
