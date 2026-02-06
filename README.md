# claude-self-learning

> Teach Claude Code about any technology. Automatically.

A Claude Code plugin that autonomously researches new technologies and generates production-ready, reusable skills.

## What It Does

When you encounter a new library, API, or framework, just tell Claude to learn it:

```
/learn anthropic api
```

Claude will:
1. Search for official documentation
2. Extract key information from multiple authoritative sources
3. Verify facts across sources
4. Ask you for refinement if needed
5. Generate a complete, reusable SKILL.md
6. Save it for permanent reuse across all your projects

## Installation

### Option 1: Clone directly

```bash
# Clone into your plugins directory
git clone https://github.com/ychampion/claude-self-learning ~/.claude/plugins/claude-self-learning
```

### Option 2: Add to config

Add to your Claude Code settings:

```json
{
  "plugins": ["ychampion/claude-self-learning"]
}
```

## Requirements

- **Tavily API**: This plugin uses Tavily for web search and extraction
- Configure your Tavily API key in environment variables

## Usage

### Learn a new technology

```
/learn anthropic api
/learn stripe webhooks
/learn prisma orm
/learn nextjs app router
```

### Update an existing skill

```
/update-skill anthropic api
```

Re-researches and updates the skill with the latest information.

### List all learned skills

```
/list-skills
/list-skills --global    # Only ~/.claude/skills
/list-skills --local     # Only ./.claude/skills
```

## How It Works

```
User: /learn <topic>
         │
         ▼
┌─────────────────────────┐
│    Researcher Agent     │ ──→ Tavily Search + Extract
│  (Discovers sources,    │     (Official docs, APIs,
│   extracts content)     │      getting started guides)
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Interactive Review    │ ──→ User chooses focus areas
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Skill Generator Agent  │ ──→ SKILL.md + .meta.json
│  (Creates structured    │     (Complete skill with
│   skill from research)  │      version tracking)
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│    Storage Options      │ ──→ Local / Global / Gist
└─────────────────────────┘
```

## Features

- **Multi-source verification**: Cross-checks facts across 3-5 authoritative sources
- **Interactive learning**: Asks clarifying questions for broad topics
- **Skill versioning**: Tracks updates with .meta.json metadata
- **Git integration**: Auto-commits generated skills (optional)
- **Production-ready output**: Error handling, best practices, real examples

## Generated Skill Example

Here's what a generated skill looks like:

```markdown
---
name: anthropic-api
description: Complete guide to using the Anthropic Claude API for text generation and AI assistants
version: 1.0.0
sources_verified: 2024-03-15
---

# Anthropic API

The Anthropic API provides access to Claude, a family of AI assistants...

## Quick Reference

| Item | Value |
|------|-------|
| Official Docs | [docs.anthropic.com](https://docs.anthropic.com) |
| Installation | `pip install anthropic` / `bun add @anthropic-ai/sdk` |
| Auth Required | Yes - API key from console.anthropic.com |

## Installation
...

## Basic Usage
...
```

## Storage Locations

Generated skills can be saved to:

| Location | Path | Use Case |
|----------|------|----------|
| Project-local | `./.claude/skills/<topic>/` | Project-specific knowledge |
| User-global | `~/.claude/skills/<topic>/` | Available in all projects |
| Plugin storage | `<plugin>/storage/skills/<topic>/` | Git-tracked, shareable |

## Configuration

No configuration required. The plugin uses:
- Tavily for web search (via existing `~/.agents/skills/search/` scripts)
- Standard Claude Code skill format

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Credits

Inspired by [philschmid/self-learning-skill](https://github.com/philschmid/self-learning-skill) for Gemini CLI.

## License

MIT
