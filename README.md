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

```bash
git clone https://github.com/ychampion/claude-self-learning ~/.claude/plugins/claude-self-learning
```

## Requirements

- Tavily API key in environment variables

## Usage

### Learn a new technology

```
/learn anthropic api
/learn stripe webhooks
/learn prisma orm
```

### Update an existing skill

```
/update-skill anthropic api
```

### List all learned skills

```
/list-skills
```

## How It Works

```
/learn <topic>
    │
    ▼
┌─────────────────────┐
│  Researcher Agent   │ → Tavily Search + Extract
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  Interactive Review │ → User chooses focus areas
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  Skill Generator    │ → SKILL.md + .meta.json
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  Storage Options    │ → Local / Global
└─────────────────────┘
```

## Features

- Multi-source verification
- Interactive learning
- Skill versioning
- Git integration
- Production-ready output

## Storage Locations

| Location | Path |
|----------|------|
| Project-local | `./.claude/skills/<topic>/` |
| User-global | `~/.claude/skills/<topic>/` |
| Plugin storage | `./storage/skills/<topic>/` |

## License

MIT
