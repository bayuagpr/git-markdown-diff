# GitLoom Diff

[![npm version](https://badge.fury.io/js/gitloom-diff.svg)](https://www.npmjs.com/package/gitloom-diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/gitloom-diff.svg)](https://nodejs.org)

> ⚠️ **Early Stage Project**: GitLoom Diff is currently in active development and not yet production-ready. Expect frequent breaking changes and major updates as we evolve the tool. Use with caution in production environments.

**Stop squinting at those git provider diff views.** Generate beautiful, searchable, IDE-friendly git diffs in markdown format.

![Demo GIF showing diff generation]() <!-- Add demo gif -->

## Quick Start

```bash
npm install -g gitloom-diff

# Basic usage
gitloom-diff 

# Compare branches
gitloom-diff -s feature/awesome -e main
```

## Why You'll Love This

GitHub, GitLab, or any other git provider diffs can be hard to parse - especially for large changes. This tool gives you a better diff experience with:

- 🚀 **Beautiful Local Diffs**
  - Works with any git provider
  - Syntax highlighting
  - Clean, consistent formatting

- 📝 **Markdown Export Ready For**:
  - 📄 Documentation & issue tracking
  - 🤖 AI code review (ChatGPT, Claude)
  - 📊 PR summaries & release notes
  - 🔍 Security audits

- 🔧 **Full IDE Power**:
  - 🔍 Fast full-text search
  - 🎯 Regex & pattern matching
  - 🌳 File tree navigation
  - 🖼️ Rich markdown preview
  - 🔖 Bookmarking changes

## Features In Detail

- 📊 **Smart Analysis**
  - Per-file change statistics
  - Commit message history
  - File diff summaries
  - Progress tracking for large diffs

- 🧹 **Intelligent Filtering**
  - Excludes build artifacts
  - Skips dependency files
  - Removes sensitive data
  - Customizable patterns

- 💡 **Flexible Comparison**
  - Between any commits
  - Across branches
  - Between tags
  - With remote branches

## Output Structure

```
📁 git-diffs/
├── 📊 DIFF_INDEX.md     # Overview of all changes
├── src/
│   ├── 📝 api.js.md    # Per-file diffs with syntax highlighting
│   └── components/
│       └── 📝 Button.js.md
```

### Sample Diff Output

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

## Usage

### Basic Commands

```bash
# Compare commits
gitloom-diff -s abc123 -e def456

# Compare branches
gitloom-diff -s feature/branch -e main

# Compare tags
gitloom-diff -s v1.1.0 -e v1.0.0

# Compare with remote
gitloom-diff -s origin/main -e main

# Compare staged changes
gitloom-diff -s HEAD -e --staged
```

### Configuration

```bash
Options:
  -s, --start-ref <ref>      Starting reference (newer state)
  -e, --end-ref <ref>        Ending reference (older state)
  -o, --output <dir>         Output directory (default: "git-diffs")
  --exclude <patterns...>    Additional file patterns to exclude
  -f, --format <format>      Diff format: diff|unified|side-by-side
  --light-mode              Use light mode theme
  -h, --help                Display help
```

### Advanced Examples

```bash
# Side-by-side diff with custom output
gitloom-diff -s main -e develop -o pr-123-diffs -f side-by-side

# Exclude patterns
gitloom-diff --exclude "*.test.js" "docs/**"

# Multiple options
gitloom-diff \
  -s feature/new-ui \
  -e develop \
  -o ui-changes \
  -f side-by-side \
  --exclude "*.test.js" "*.snap" \
  --light-mode
```

## Programmatic Usage

```javascript
const GitLoomDiff = require('gitloom-diff');

const differ = new GitLoomDiff({
  outputDir: 'custom-dir',
  exclusions: ['*.log'],
  diffFormat: 'side-by-side',
  darkMode: false
});

await differ.run('main', 'feature/branch');
```

### Integration Examples

```javascript
// Code Review Tool Integration
async function generateReviewDiff(prNumber) {
  const differ = new GitLoomDiff({
    outputDir: `pr-${prNumber}-diff`
  });
  await differ.run('main', `pr-${prNumber}`);
}

// Git Hook Integration
async function preCommitHook() {
  const differ = new GitLoomDiff();
  await differ.run('HEAD', '--staged');
}

// CI/CD Pipeline
async function generatePRDiff() {
  const differ = new GitLoomDiff({
    exclusions: ['*.lock', 'dist/*']
  });
  await differ.run(process.env.TARGET_BRANCH, process.env.PR_BRANCH);
}
```

## Auto-Excluded Files

- Package manager locks (package-lock.json, yarn.lock)
- Dependencies (node_modules/, vendor/)
- Build outputs (dist/, build/, .next/)
- IDE and OS files (.idea/, .vscode/, .DS_Store)
- Logs and environment files

## Requirements

- Node.js >= 18
- Git installed and accessible

## Contributing

1. Fork and clone
2. `npm install`
3. Create feature branch
4. Make changes
5. Submit PR

## Troubleshooting

### Common Issues

1. **Git Command Fails**
   - Ensure you're in a git repo
   - Check git installation
   - Verify git config

2. **No Output**
   - Verify changes exist
   - Check exclusion patterns
   - Confirm git range

3. **Exclusion Issues**
   - Use forward slashes
   - Escape wildcards
   - Use `dir/**` for directories

## License

MIT

## Acknowledgments

Built with:
- commander
- ora