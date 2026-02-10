#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig } from './config.js';
import { SkillManager } from './skill-manager.js';
import { QualityChecker } from './quality-checker.js';
import { TemplateEngine } from './template-engine.js';
import { SkillLocation } from './types.js';
import type { SkillMetadata } from './types.js';
import { formatDate } from './utils.js';

const program = new Command();
const config = getConfig();

program
  .name('skill-manager')
  .description('Zero-cost, local-first Claude skill management')
  .version('2.0.0');

// Learn command - create a new skill from template
program
  .command('learn <topic>')
  .description('Create a new skill using templates')
  .option('-t, --template <name>', 'Template name (api-library, framework, cli-tool, minimal)', 'minimal')
  .option('-l, --location <type>', 'Storage location (local, global, plugin)', 'global')
  .option('--tags <tags>', 'Comma-separated tags')
  .action(async (topic, options) => {
    const spinner = ora('Creating skill...').start();

    try {
      const manager = new SkillManager(config);
      await manager.initialize();

      // Check if skill exists
      const existing = await manager.findSkill(topic);
      if (existing) {
        spinner.fail(chalk.red(`Skill "${topic}" already exists at ${existing.location}`));
        console.log(chalk.yellow('Use "skill-manager update" to update it.'));
        process.exit(1);
      }

      const templateEngine = new TemplateEngine(config.templatesDir);
      const tags = options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [];

      const content = await templateEngine.createSkillFromTemplate(options.template, {
        name: topic,
        description: `Comprehensive guide for ${topic}`,
        tags,
      });

      const metadata: SkillMetadata = {
        name: topic,
        description: `Comprehensive guide for ${topic}`,
        version: '1.0.0',
        sources_verified: formatDate(),
        tags,
      };

      const location = options.location as SkillLocation;
      const path = await manager.saveSkill(topic, content, metadata, location);

      spinner.succeed(chalk.green(`Skill created successfully!`));
      console.log(chalk.cyan(`\nLocation: ${path}`));
      console.log(chalk.yellow('\nEdit the file to add your content.'));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to create skill: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List all skills')
  .option('-l, --location <type>', 'Filter by location (local, global, plugin)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Loading skills...').start();

    try {
      const manager = new SkillManager(config);
      await manager.initialize();

      const location = options.location ? [options.location as SkillLocation] : undefined;
      const skills = await manager.listSkills(location);

      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(skills, null, 2));
        return;
      }

      if (skills.length === 0) {
        console.log(chalk.yellow('No skills found.'));
        console.log(chalk.cyan('\nCreate one with: skill-manager learn <topic>'));
        return;
      }

      console.log(chalk.bold(`\n📚 Found ${skills.length} skill(s):\n`));

      for (const skill of skills) {
        const qualityColor = (skill.metadata.quality_score || 0) >= 70 ? chalk.green : 
                            (skill.metadata.quality_score || 0) >= 50 ? chalk.yellow : chalk.red;
        
        console.log(chalk.bold(skill.metadata.name));
        console.log(`  ${chalk.gray(skill.metadata.description)}`);
        console.log(`  Version: ${skill.metadata.version} | Location: ${skill.location}`);
        console.log(`  Quality: ${qualityColor((skill.metadata.quality_score || 0).toFixed(0))}% | ` +
                   `Code blocks: ${skill.codeBlocks.length}`);
        if (skill.metadata.tags && skill.metadata.tags.length > 0) {
          console.log(`  Tags: ${skill.metadata.tags.map(t => chalk.blue(t)).join(', ')}`);
        }
        console.log();
      }
    } catch (error) {
      spinner.fail(chalk.red(`Failed to list skills: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Search command
program
  .command('search <query>')
  .description('Search skills by name, description, or tags')
  .option('-l, --limit <number>', 'Maximum results', '10')
  .action(async (query, options) => {
    const spinner = ora('Searching...').start();

    try {
      const manager = new SkillManager(config);
      await manager.initialize();

      const skills = await manager.searchSkills(query, parseInt(options.limit));

      spinner.stop();

      if (skills.length === 0) {
        console.log(chalk.yellow(`No skills found matching "${query}"`));
        return;
      }

      console.log(chalk.bold(`\n🔍 Found ${skills.length} matching skill(s):\n`));

      for (const skill of skills) {
        console.log(chalk.bold.green(skill.metadata.name));
        console.log(`  ${chalk.gray(skill.metadata.description)}`);
        console.log(`  ${chalk.cyan(skill.path)}`);
        console.log();
      }
    } catch (error) {
      spinner.fail(chalk.red(`Search failed: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Check command - quality check
program
  .command('check <topic>')
  .description('Run quality checks on a skill')
  .action(async (topic) => {
    const spinner = ora('Running quality checks...').start();

    try {
      const manager = new SkillManager(config);
      await manager.initialize();

      const skill = await manager.findSkill(topic);
      if (!skill) {
        spinner.fail(chalk.red(`Skill "${topic}" not found`));
        process.exit(1);
      }

      const checker = new QualityChecker();
      const result = checker.check(skill);

      spinner.stop();

      console.log(chalk.bold(`\n📊 Quality Report for "${skill.metadata.name}":\n`));
      
      const scoreColor = result.score >= 70 ? chalk.green : result.score >= 50 ? chalk.yellow : chalk.red;
      console.log(chalk.bold(`Score: ${scoreColor(result.score)}/100\n`));

      if (result.issues.length > 0) {
        console.log(chalk.bold('Issues:'));
        for (const issue of result.issues) {
          const icon = issue.severity === 'error' ? '❌' : 
                      issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          const color = issue.severity === 'error' ? chalk.red :
                       issue.severity === 'warning' ? chalk.yellow : chalk.cyan;
          
          console.log(`  ${icon} ${color(issue.message)}`);
          if (issue.line) {
            console.log(`     Line ${issue.line}`);
          }
        }
        console.log();
      }

      if (result.suggestions.length > 0) {
        console.log(chalk.bold('Suggestions:'));
        for (const suggestion of result.suggestions) {
          console.log(`  💡 ${chalk.cyan(suggestion)}`);
        }
        console.log();
      }

      if (result.issues.length === 0 && result.suggestions.length === 0) {
        console.log(chalk.green('✅ No issues found! Great work!'));
      }
    } catch (error) {
      spinner.fail(chalk.red(`Quality check failed: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Stats command
program
  .command('stats')
  .description('Show statistics about your skills')
  .action(async () => {
    const spinner = ora('Calculating statistics...').start();

    try {
      const manager = new SkillManager(config);
      await manager.initialize();

      const stats = await manager.getStats();

      spinner.stop();

      console.log(chalk.bold('\n📊 Skills Statistics:\n'));
      console.log(`Total skills: ${chalk.green(stats.total)}`);
      console.log(`Average quality: ${chalk.yellow(stats.averageQuality.toFixed(1))}%`);
      console.log(`Total code blocks: ${chalk.cyan(stats.totalCodeBlocks)}`);
      console.log();
      
      console.log(chalk.bold('By location:'));
      console.log(`  Local: ${stats.byLocation.local}`);
      console.log(`  Global: ${stats.byLocation.global}`);
      console.log(`  Plugin: ${stats.byLocation.plugin}`);
      console.log();

      if (stats.topTags.length > 0) {
        console.log(chalk.bold('Top tags:'));
        for (const { tag, count } of stats.topTags) {
          console.log(`  ${chalk.blue(tag)}: ${count}`);
        }
      }
    } catch (error) {
      spinner.fail(chalk.red(`Failed to get statistics: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Rebuild index command
program
  .command('reindex')
  .description('Rebuild the skills index')
  .action(async () => {
    const spinner = ora('Rebuilding index...').start();

    try {
      const manager = new SkillManager(config);
      await manager.rebuildIndex();

      spinner.succeed(chalk.green('Index rebuilt successfully!'));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to rebuild index: ${(error as Error).message}`));
      process.exit(1);
    }
  });

program.parse();
