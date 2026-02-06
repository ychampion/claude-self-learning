# claude-self-learning

[![Made by Yashas G](https://img.shields.io/badge/Made%20by-Yashas%20G-blue?style=flat&logo=x&logoColor=white)](https://x.com/yashasgunderia)

> Teach Claude Code about any technology. Automatically.

A Claude Code plugin that autonomously researches new technologies and generates production-ready, reusable skills.

---

## Quick Start

```bash
/plugin install github:ychampion/claude-self-learning
```

Then use:

```
/learn anthropic api
```

---

## How It Works

```
/learn <topic>
       │
       ▼
┌──────────────────────┐
│   Researcher Agent   │ → Web Search + Content Extraction
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│   Interactive Review │ → User chooses focus areas
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│   Skill Generator    │ → SKILL.md + .meta.json
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│   Storage Options    │ → Local / Global / Plugin
└──────────────────────┘
```

---

## Commands

| Command | Description |
|---------|-------------|
| `/learn <topic>` | Research a topic and generate a skill |
| `/update-skill <topic>` | Refresh an existing skill with latest info |
| `/list-skills` | View all generated skills |

---

## Features

- **Multi-source verification** - Cross-checks facts across authoritative sources
- **Interactive learning** - Asks clarifying questions for broad topics
- **Skill versioning** - Tracks updates with .meta.json metadata
- **Production-ready output** - Error handling, best practices, real examples

---

## Storage Locations

| Location | Path | Use Case |
|----------|------|----------|
| Project-local | `./.claude/skills/<topic>/` | Project-specific |
| User-global | `~/.claude/skills/<topic>/` | All projects |
| Plugin storage | `./storage/skills/<topic>/` | Git-tracked |

---

## Example Generated Skill

```markdown
---
name: anthropic-api
description: Complete guide to using the Anthropic Claude API
version: 1.0.0
sources_verified: 2026-02-07
---

# Anthropic API

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

---

## Contributing

Contributions welcome! Please fork, create a feature branch, and submit a PR.

---

## License

MIT

---

**Built for Claude Code** | **Made with ❤️**
