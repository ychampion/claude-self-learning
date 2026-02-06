---
name: learn
description: Research a technology and generate a reusable Claude skill
arguments: <topic>
---

# /learn Command

Research any technology, library, framework, or API and generate a production-ready Claude skill.

## Usage

```
/learn <topic>
```

Examples:
- `/learn anthropic api`
- `/learn stripe webhooks`
- `/learn prisma orm`
- `/learn nextjs app router`

## Process

1. Parse the topic from arguments
2. Launch researcher agent to discover and extract information
3. Ask user for refinement if needed
4. Launch skill-generator agent to create SKILL.md
5. Offer storage options (local, global, gist)
6. Save and optionally git commit

## Implementation

When invoked:

### Step 1: Parse Topic

Extract the topic from `$ARGUMENTS`. If no topic provided, ask the user what they want to learn.

### Step 2: Check for Existing Skill

Look for existing skill in these locations:
- `./storage/skills/<slugified-topic>/SKILL.md`
- `~/.claude/skills/<slugified-topic>/SKILL.md`
- `./.claude/skills/<slugified-topic>/SKILL.md`

If found, ask: "A skill for '<topic>' already exists (v<version>, last updated <date>). Would you like to:
1. View the existing skill
2. Update it with fresh research
3. Create a new one with a different name"

### Step 3: Launch Researcher Agent

If creating new or updating:

```
Use Task tool with subagent_type "claude-self-learning:researcher"
Prompt: "Research '<topic>' thoroughly. Find official docs, extract installation, auth, usage examples, best practices. Return structured findings."
```

### Step 4: Interactive Refinement

After research completes, summarize findings and ask:

"I've researched <topic>. Here's what I found:
- **Official docs**: [URL]
- **Installation**: [summary]
- **Key features**: [list]
- **Code examples available for**: [languages]

Should I:
1. Proceed with generating the skill as-is
2. Deep-dive into a specific feature
3. Add examples for additional languages
4. Focus on a particular use case"

### Step 5: Launch Skill Generator

```
Use Task tool with subagent_type "claude-self-learning:skill-generator"
Prompt: "Generate a SKILL.md for '<topic>' using this research:

<research_results>
[Insert structured research from researcher agent]
</research_results>

Follow the skill template format exactly."
```

### Step 6: Offer Storage Options

"Skill generated! Where should I save it?

1. **Project-local**: `.claude/skills/<topic>/SKILL.md` (this project only)
2. **User-global**: `~/.claude/skills/<topic>/SKILL.md` (all projects)
3. **Plugin storage**: `<plugin-path>/storage/skills/<topic>/SKILL.md` (git-tracked, shareable)
4. **GitHub Gist**: Create a public gist for sharing"

### Step 7: Save Files

Create:
- `SKILL.md` - The generated skill
- `.meta.json` - Metadata for versioning

```json
{
  "created": "<ISO date>",
  "updated": "<ISO date>",
  "sources": ["url1", "url2"],
  "topic": "<original query>",
  "version": "1.0.0"
}
```

### Step 8: Git Commit (Optional)

If saving to a git-tracked location, offer to commit:

"Would you like me to commit this new skill to git?"

If yes:
```bash
git add <skill-path>
git commit -m "feat: add skill for <topic>"
```

## Error Handling

- If web search fails, try alternative queries or different search terms
- If no official docs found, expand search to include tutorials
- If topic is ambiguous, ask for clarification before researching
