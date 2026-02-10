# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-02-10

### Added

- **Zero-cost, local-first architecture** - Complete rewrite eliminating all external API dependencies
- **Smart quality scoring system** - Automatic 0-100 scoring with 20+ validation checks
- **Instant fuzzy search** - Fast skill discovery with intelligent matching
- **Auto-indexing system** - Persistent skill index for O(1) lookups
- **Rich template system** - API library, framework, CLI tool, and minimal templates
- **Code intelligence** - Automatic extraction and validation of code blocks
- **Security scanning** - Detection of hardcoded credentials and insecure patterns
- **Multi-location support** - Local, global, and plugin storage locations
- **Analytics dashboard** - Track skill quality and usage statistics
- **Comprehensive test suite** - 38 unit tests with >70% coverage
- **Full TypeScript implementation** - Type-safe with Zod validation
- **Production-ready CLI** - Beautiful terminal UI with Commander, Chalk, and Ora
- **Quality checker module** - Validates content structure, completeness, and security
- **Template engine** - Generate consistent, high-quality skills
- **Skill manager** - Core API for skill operations

### Changed

- **Breaking**: Removed all external API dependencies (Anthropic, OpenAI, Brave, etc.)
- **Breaking**: Changed from AI-powered research to template-based skill creation
- Refactored entire codebase from specification-only to production implementation
- Updated README with new zero-cost approach and feature set
- Improved documentation with architecture diagrams and examples

### Removed

- External API integrations (Anthropic, OpenAI, web search)
- Agent orchestrator (replaced with templates)
- Web researcher module (no longer needed)
- API key configuration requirements

## [1.1.0] - Previous Version

### Fixed

- Correct agent invocation
- Remove duplicate plugin.json

## [1.0.0] - Initial Release

### Added

- Initial plugin specification
- Agent definitions (researcher, skill-generator)
- Command definitions (learn, list-skills, update-skill)
- Basic storage structure
