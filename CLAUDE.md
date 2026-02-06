# Claude Self-Learning Plugin

## Overview

This plugin enables Claude to autonomously research any technology, library, or API and generate production-ready skills that can be reused across projects.

## Commands

- `/learn <topic>` - Research a topic and generate a skill
- `/update-skill <topic>` - Refresh an existing skill with latest info
- `/list-skills` - View all generated skills

## Agents

### researcher
Deep research agent that discovers and extracts information using Tavily search and extract. Prioritizes official documentation and verifies facts across multiple sources.

### skill-generator
Transforms research findings into structured SKILL.md files following the standard template with installation, authentication, usage examples, and best practices.

## Conventions

### Web Search
- ALWAYS use Tavily scripts, NEVER WebSearch/WebFetch (blocked)
- Search: `~/.agents/skills/search/scripts/search.sh`
- Extract: `~/.agents/skills/extract/scripts/extract.sh`

### Skill Quality
- Keep skills between 2,000-4,000 tokens
- Include both Python and TypeScript examples
- All code must have error handling
- Use environment variables for secrets
- Include verification date

### Storage Locations
- Project-local: `./.claude/skills/<topic>/`
- User-global: `~/.claude/skills/<topic>/`
- Plugin storage: `./storage/skills/<topic>/`

## Development

### Testing
```bash
# Validate plugin structure
./scripts/test-plugin.sh

# Run integration tests
./scripts/test-integration.sh
```

### Adding Features
1. Update the appropriate command/agent/skill
2. Run tests
3. Update CHANGELOG.md
4. Commit with descriptive message
