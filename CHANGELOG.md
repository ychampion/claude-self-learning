# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-07

### Added
- Production-ready plugin structure following compound-engineering patterns
- Comprehensive test scripts for validation
- CLAUDE.md with development guidelines
- CHANGELOG.md for version tracking
- Enhanced plugin.json with full metadata
- Proper error handling in all scripts
- Cross-platform compatibility (Windows/Unix)

### Changed
- Improved researcher agent with better source prioritization
- Enhanced skill-generator with stricter quality checks
- Better hook scripts with proper exit codes

### Fixed
- Shell script compatibility issues
- Path handling for Windows environments

## [1.0.0] - 2026-02-07

### Added
- Initial implementation
- `/learn <topic>` command for researching technologies
- `/update-skill <topic>` command for refreshing skills
- `/list-skills` command for viewing generated skills
- Researcher agent for multi-source discovery
- Skill-generator agent for structured output
- Auto-commit hook for git integration
- Skill template and best practices documentation
- Git-backed storage for version control
