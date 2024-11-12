# Git Markdown Diff Tool

[![npm version](https://badge.fury.io/js/git-markdown-diff.svg)](https://www.npmjs.com/package/git-markdown-diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/git-markdown-diff.svg)](https://nodejs.org)

A powerful CLI tool that generates beautifully formatted markdown files from git diffs, making code changes more readable and shareable.

## Why?

So GitHub/GitLab/Bitbucket diff views works for you? Well good for you! But sometimes those remote git providers might be not your remote git provider and/or your diff view from your remote git providers might be not so friendly moreover if you have to review big changes (at least for your eyes). This tool simply offers an alternative that lets you:

- Generate clean, readable diffs when GitHub/GitLab/Bitbucket or any other git provider diff views are unavailable or hard to use
- Work offline - only requires internet for comparing remote branches
- Export diffs as markdown files to:
  - Attach to tickets and documentation
  - Share with AI tools (ChatGPT, Claude, etc.) for code review assistance
  - Create permanent snapshots of important changes
  - Share easily with stakeholders
- Smart filtering of noise like lockfiles and build artifacts
- Editor-agnostic - works with any tool that supports markdown
- Leverage your IDE's features to analyze diffs:
  - Full-text search across all changes
  - "Find in Files" for code patterns
  - File tree navigation by directory
  - Markdown preview for formatted diffs
  - Side-by-side diff comparison
  - Bookmarking for later review


## Features

- 📝 Generates markdown files for each changed file in your git repository
- 🎨 Syntax-highlighted diff output
- 📊 Includes file statistics and change summaries
- 🔍 Automatic exclusion of common build artifacts and sensitive files
- 📁 Output directory structure mirrors your repository layout with a searchable index file containing:
  - Total change statistics
  - Commit messages between compared refs
  - Links to individual file diffs with change summaries
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

Generate diffs between your working tree and the last commit:

```bash
git-markdown-diff
```

### Comparing Specific References

Compare changes between any git references (commits, branches, or tags):

```bash
git-markdown-diff --start-ref <ref> --end-ref <ref>
```

Examples:
```bash
# Compare between two commits
git-markdown-diff -s abc123 -e def456

# Compare between branches (changes in feature branch)
git-markdown-diff -s feature/branch -e main

# Compare between tags (changes from v1.0.0 to v1.1.0)
git-markdown-diff -s v1.1.0 -e v1.0.0

# Compare with remote branch
git-markdown-diff -s origin/main -e main

# Compare staged changes
git-markdown-diff -s HEAD -e --staged
```

### Configuration Options

```bash
Options:
  -s, --start-ref <ref>      Starting reference (newer state)
  -e, --end-ref <ref>        Ending reference (older state)
  -o, --output <dir>         Output directory (default: "git-diffs")
  --exclude <patterns...>    Additional file patterns to exclude
  -f, --format <format>      Diff format: diff, unified, side-by-side (default: "diff")
  --light-mode              Use light mode theme instead of dark mode
  -h, --help                Display help
```

### Advanced Examples

```bash
# Custom output directory with side-by-side diffs
git-markdown-diff -s main -e develop -o pr-123-diffs -f side-by-side

# Exclude specific files/patterns
git-markdown-diff --exclude "*.test.js" "docs/**" "*.md"

# Compare specific commit range with unified diff
git-markdown-diff -s HEAD -e HEAD~5 -f unified

# Light mode theme with custom output
git-markdown-diff -s release -e main --light-mode -o release-diffs

# Multiple options combined
git-markdown-diff \
  -s feature/new-ui \
  -e develop \
  -o ui-changes \
  -f side-by-side \
  --exclude "*.test.js" "*.snap" \
  --light-mode
```

> **Note**: The order of refs matters! Use `-s` for the newer state and `-e` for the older state to get the correct diff direction.

### Programmatic Usage

```javascript
const GitMarkdownDiff = require('git-markdown-diff');

const differ = new GitMarkdownDiff({
  outputDir: 'custom-dir',
  exclusions: ['*.log', '*.tmp'],
  diffFormat: 'side-by-side',
  darkMode: false
});

await differ.run('main', 'feature/branch');
```

#### Use it in your code:
```javascript
// Generate diffs for code review tools
const GitMarkdownDiff = require('git-markdown-diff');

async function generateReviewDiff(prNumber) {
  const differ = new GitMarkdownDiff({
    outputDir: `pr-${prNumber}-diff`,
    diffFormat: 'side-by-side'
  });
  
  await differ.run('main', `pr-${prNumber}`);
  return `pr-${prNumber}-diff/README.md`;
}
```

#### Git hooks integration:
```javascript
// pre-commit hook (/.git/hooks/pre-commit)
const GitMarkdownDiff = require('git-markdown-diff');

async function preCommitHook() {
  const differ = new GitMarkdownDiff({
    outputDir: '.git/diff-preview',
    diffFormat: 'unified'
  });
  
  // Compare staged changes
  await differ.run('HEAD', '--staged');
  // Open diff preview in default browser
  require('open')('.git/diff-preview/README.md');
}
```

#### CI/CD pipeline:
```javascript
// GitHub Actions, Jenkins, etc.
const GitMarkdownDiff = require('git-markdown-diff');

async function generatePRDiff() {
  const differ = new GitMarkdownDiff({
    outputDir: 'ci-diff-output',
    exclusions: ['*.lock', 'dist/*']
  });
  
  // Compare PR branch with target branch
  await differ.run(process.env.TARGET_BRANCH, process.env.PR_BRANCH);
  
  // Upload diff as artifact or send to review system
  await uploadArtifact('ci-diff-output');
}
```

### Diff Formats

- `diff` (default) - Standard git diff format
- `unified` - Unified diff with 3 lines of context
- `side-by-side` - Two-column comparison view

## Output Structure

The tool creates a `git-diffs` directory with the following structure:

```
git-diffs/
├── DIFF_INDEX.md            # Index file with summary and links
├── src/                     # Mirrors your repository structure
│   ├── file1.js.md         # Diff for file1.js
│   └── components/
│       └── Component.js.md  # Diff for Component.js
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

- [x] Custom output directory option
- [ ] HTML export option
- [ ] Integration with CI/CD pipelines
- [x] Custom exclusion patterns
- [x] Multiple diff format support
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
   - On Windows, ensure paths don't contain special characters

2. **No output generated**
   - Verify you have changes to diff
   - Check if files are excluded by default patterns (see Excluded Files section)
   - Try specifying explicit commit ranges
   - Ensure your git range is correct (e.g., `master..feature` vs `feature..master`)

3. **Exclusion patterns not working**
   - Use forward slashes (/) even on Windows
   - Wildcards need proper escaping: `\*.log` or `"*.log"`
   - For directories, use `dir/**` to exclude all subdirectories