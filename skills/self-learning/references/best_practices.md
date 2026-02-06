# Best Practices for Creating Skills

This guide outlines what makes a great Claude skill.

## Core Principles

### 1. Clarity Over Cleverness

A skill should be immediately understandable. Avoid:
- Overly complex code examples
- Unnecessary abstractions
- Jargon without explanation

### 2. Complete Examples

Every code example should be:
- Runnable as-is (with appropriate credentials)
- Include all necessary imports
- Have proper error handling
- Show expected output where helpful

### 3. Accuracy Over Completeness

It's better to have a smaller, accurate skill than a comprehensive but error-prone one.
- Only include verified information
- Cite sources
- Note version-specific behavior
- Flag uncertainty explicitly

## Structure Guidelines

### Frontmatter

Required fields:
```yaml
---
name: slugified-name       # URL-safe, lowercase with hyphens
description: <one line>    # Clear, actionable description
version: 1.0.0             # Semantic versioning
sources_verified: YYYY-MM-DD
---
```

### Quick Reference Table

Always include for easy scanning:
- Official docs link
- Installation command
- Auth requirement
- Primary use case

### Code Examples

**Python best practices:**
```python
# Use type hints where they add clarity
def example_function(param: str) -> dict:
    """Docstring for context."""
    ...

# Always handle errors
try:
    result = api_call()
except SpecificError as e:
    handle_error(e)
```

**TypeScript best practices:**
```typescript
// Use TypeScript features properly
interface Response {
  data: string;
  status: number;
}

// Async/await with proper error handling
async function example(): Promise<Response> {
  try {
    const response = await client.method();
    return response;
  } catch (error) {
    if (error instanceof APIError) {
      // Handle known errors
    }
    throw error;
  }
}
```

### Best Practices Section

Format as numbered list with:
1. **Bold title**: Explanation of why and how

Good example:
> 1. **Use environment variables for API keys**: Never hardcode secrets. Use `os.environ.get()` in Python or `process.env` in Node.js to load credentials at runtime.

Bad example:
> 1. Use environment variables (too vague)

### Common Errors Table

Include practical, real-world errors:

| Error | Cause | Fix |
|-------|-------|-----|
| `AuthenticationError: Invalid API key` | Key is malformed or revoked | Verify key in dashboard, regenerate if needed |
| `RateLimitError: Too many requests` | Exceeded API rate limits | Implement exponential backoff, reduce request frequency |

## Quality Checklist

Before finalizing a skill, verify:

### Content
- [ ] All code examples tested and working
- [ ] No placeholder values remain
- [ ] Sources are cited
- [ ] Version information is included
- [ ] Verification date is accurate

### Format
- [ ] Frontmatter is complete
- [ ] Headers are hierarchical
- [ ] Code blocks specify language
- [ ] Tables are properly formatted
- [ ] Links are valid

### Accuracy
- [ ] Information verified against official docs
- [ ] No hallucinated features or methods
- [ ] Deprecations are noted
- [ ] Version-specific behavior is flagged

### Usability
- [ ] Examples progress from simple to advanced
- [ ] Error handling is included
- [ ] Best practices are actionable
- [ ] Quick reference enables fast lookup

## Anti-Patterns to Avoid

1. **Hallucinated methods**: Never invent API methods that don't exist
2. **Outdated information**: Always verify against current docs
3. **Missing error handling**: All examples should handle failures
4. **Hardcoded secrets**: Always use environment variables
5. **Incomplete examples**: Don't omit imports or setup code
6. **Excessive length**: Keep skills focused and scannable
7. **Version-agnostic claims**: Note which versions apply

## Token Budget

Target skill length: **2,000-4,000 tokens**

- Under 2,000: May be missing important content
- Over 4,000: Consider splitting into focused skills

## Maintenance

Skills should be updated when:
- API versions change significantly
- New major features are added
- Best practices evolve
- Sources return 404

Use `/update-skill <topic>` to refresh with latest information.
