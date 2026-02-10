# {{name}}

{{description}}

## Overview

{{overview}}

## Installation

### Global Installation

```bash
npm install -g {{npmPackage}}
# or
brew install {{name}}
```

### Per-Project Installation

```bash
npm install --save-dev {{npmPackage}}
```

## Basic Commands

### Initialize

```bash
{{name}} init
```

### Common Operations

```bash
# List items
{{name}} list

# Create new item
{{name}} create <name>

# Delete item
{{name}} delete <name>
```

## Configuration

Configuration file: `.{{name}}rc` or `{{name}}.config.js`

```json
{
  "option1": "value1",
  "option2": "value2"
}
```

## Advanced Usage

### Scripting

```bash
#!/bin/bash

# Batch operations
for item in item1 item2 item3; do
  {{name}} process "$item"
done
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Run {{name}}
  run: {{name}} check --ci
```

## Best Practices

- **Version Control**: Commit configuration files
- **Documentation**: Document custom scripts
- **Automation**: Use in CI/CD pipelines
- **Security**: Review security implications

## Troubleshooting

### Common Issues

**Issue**: Command not found
```bash
# Solution: Check installation
which {{name}}
npm list -g {{npmPackage}}
```

**Issue**: Permission denied
```bash
# Solution: Run with appropriate permissions
sudo {{name}} command
```

## Resources

- [Official Documentation]({{officialDocs}})
- [GitHub Repository]({{githubRepo}})
