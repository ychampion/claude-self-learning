---
name: update-skill
description: Update an existing skill with fresh information
arguments: <topic>
---

# /update-skill Command

Re-research a topic and update its skill with the latest information.

## Usage

```
/update-skill <topic>
```

Examples:
- `/update-skill anthropic api`
- `/update-skill stripe webhooks`

## Process

### Step 1: Find Existing Skill

Search for the skill in order:
1. `./.claude/skills/<topic>/`
2. `~/.claude/skills/<topic>/`
3. `<plugin-path>/storage/skills/<topic>/`

If not found:
"No existing skill found for '<topic>'. Would you like to create one? Use `/learn <topic>` instead."

### Step 2: Read Metadata

Load `.meta.json` to get:
- Original sources
- Creation date
- Current version
- Last update date

### Step 3: Re-Research

Follow the researcher agent instructions from `agents/researcher.md` with this context:

**Focus on:**
1. Check if previous sources are still valid
2. Find any new official documentation
3. Identify API changes or deprecations
4. Find new best practices
5. Note CHANGES since the last update date

### Step 4: Compare and Diff

After research:

"I've re-researched <topic>. Here's what changed:

**New information:**
- [list new findings]

**Updated information:**
- [list changes to existing content]

**Potentially outdated:**
- [list things that may need removal]

**Unchanged:**
- [list confirmed still-accurate content]

Would you like me to:
1. Generate an updated skill with all changes
2. Show a detailed diff before updating
3. Only update specific sections"

### Step 5: Generate Updated Skill

Follow the skill-generator agent instructions from `agents/skill-generator.md`:

1. Merge old skill content with new research findings
2. Increment the version number
3. Update the sources_verified date
4. Preserve working content, update changed sections

### Step 6: Show Diff and Confirm

Display a diff between old and new skill:

```diff
- version: 1.0.0
+ version: 1.1.0

- sources_verified: 2024-01-15
+ sources_verified: 2024-03-20
```

"Apply these changes? (y/n)"

### Step 7: Save and Update Metadata

Update `.meta.json`:
```json
{
  "created": "<original date>",
  "updated": "<now>",
  "sources": ["updated urls"],
  "topic": "<topic>",
  "version": "1.1.0",
  "changelog": [
    {
      "version": "1.1.0",
      "date": "<now>",
      "changes": ["Updated API examples", "Added new feature X"]
    }
  ]
}
```

### Step 8: Git Commit

If in git repo:
```bash
git add <skill-path>
git commit -m "chore: update skill for <topic> to v1.1.0"
```

## Flags

- `--force`: Skip confirmation and apply all updates
- `--dry-run`: Show what would change without applying
- `--check-sources`: Only verify if sources are still valid
