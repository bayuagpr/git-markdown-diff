# Git Markdown Diff Tool

[![npm version](https://badge.fury.io/js/git-markdown-diff.svg)](https://www.npmjs.com/package/git-markdown-diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/git-markdown-diff.svg)](https://nodejs.org)

A powerful CLI tool that generates beautifully formatted markdown files from git diffs, making code changes more readable and shareable.

## Why?

So GitHub/GitLab/Bitbucket diff views works for you? Good. But sometimes those might be not your remote git provider and/or your diff view from your remote git providers might be not so friendly moreover if you have to review big changes (at least for your eyes). This tool simply offers an alternative that lets you:

- Generate clean, readable diffs when your remote git provider diff views are unavailable or unfriendly
- Work completely offline - only needs internet access when comparing remote branches
- Export diffs as markdown to attach to tickets, docs, or discussions
- Share diffs with AI/LLM tools (ChatGPT, Claude, Copilot, etc.) to streamline code review, get suggestions, and catch potential issues
- Automatically filter out noise like lockfiles and build artifacts
- Create permanent documentation snapshots of important changes
- Share diffs easily with any stakeholders
- Use your IDE/editor's search and navigation features to analyze the generated diffs:
  - Search across all diff files to find specific changes
  - Use "Find in Files" to locate impacted code patterns
  - Leverage file tree navigation to browse changes by directory
  - Take advantage of markdown preview to view formatted diffs
  - Use split view to compare original and modified code side by side
  - Bookmark key changes for later review


## Features

- 📝 Generates markdown files for each changed file in your git repository
- 🎨 Syntax-highlighted diff output
- 📊 Includes file statistics and change summaries
- 🔍 Automatic exclusion of common build artifacts and sensitive files
- 📁 Preserves your repository's directory structure and generates a searchable diff index for easy navigation
- 💡 Support for comparing specific commits, branches, or tags
- 🚀 Progress indicators for long-running operations

## Requirements

- Node.js >= 18
- Git installed and accessible from command line

## Installation

```bash
npm install -g git-markdown-diff
```

## Usage

### Basic Usage

To generate diffs between your working tree and the last commit:

```bash
git-markdown-diff
```

### Comparing Specific References

To generate diffs between specific git references (commits, branches, or tags):

```bash
git-markdown-diff <startRef> <endRef>
```

Examples:
```bash
# Compare between two commits
git-markdown-diff abc123 def456

# Compare between branches
git-markdown-diff main feature/new-feature

# Compare between tags
git-markdown-diff v1.0.0 v1.1.0
```

## Output Structure

The tool creates a `git-diffs` directory with the following structure:

```
git-diffs/
├── README.md                 # Index file with summary and links
├── src/                      # Mirrors your repository structure
│   ├── file1.js.md          # Diff for file1.js
│   └── components/
│       └── Component.js.md   # Diff for Component.js
└── ...
```

### Generated Files

Each generated markdown file includes:

- File path and name
- File change statistics
- Syntax-highlighted diff content
- Timestamp and timezone information
- Dark-mode friendly styling

## Example Output

```markdown
# Changes in `src/components/Button.js`

## File Statistics
 src/components/Button.js | 25 +++++++++++++++++--------

## Changes
```diff
- import React from 'react';
+ import React, { useState } from 'react';

 const Button = ({ label }) => {
+  const [isHovered, setIsHovered] = useState(false);
```

## Excluded Files

The tool automatically excludes common files that typically don't need diff review:

- Package manager locks (package-lock.json, yarn.lock, etc.)
- Dependencies (node_modules/, vendor/)
- Build outputs (dist/, build/, .next/, etc.)
- IDE and OS files (.idea/, .vscode/, .DS_Store, etc.)
- Logs and debug files
- Environment and secret files
- Minified files

## Roadmap

Future improvements under consideration:

- [ ] Custom output directory option
- [ ] HTML export option
- [ ] Integration with CI/CD pipelines
- [ ] Custom exclusion patterns
- [ ] Multiple diff format support
- [ ] Interactive mode for file selection

## Contributing

We welcome contributions to improve the Git Markdown Diff Tool! Here's how you can help:

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/git-markdown-diff.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting a pull request

### Submitting Changes

1. Commit your changes with clear, descriptive commit messages
2. Push to your fork
3. Submit a pull request with a clear description of the changes

### Areas for Contribution

- Additional file exclusion patterns
- Custom styling options
- Support for different markdown formats
- Performance improvements
- Documentation improvements
- Bug fixes

## License

MIT

## Acknowledgments

This tool uses several open-source packages:
- commander - For CLI argument parsing
- ora - For progress indicators

## Troubleshooting

### Common Issues

1. **Git command fails**
   ```bash
   Error: Git command did not succeed. Script cannot proceed.
   ```
   - Ensure you're in a git repository
   - Check if git is installed: `git --version`
   - Verify git is configured: `git config --list`

2. **No output generated**
   - Verify you have changes to diff
   - Check if files are excluded by default patterns
   - Try specifying explicit commit ranges