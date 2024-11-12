# Git Markdown Diff Tool

A powerful CLI tool that generates beautifully formatted markdown files from git diffs, making code changes more readable and shareable.

## Features

- 📝 Generates markdown files for each changed file in your git repository
- 🎨 Syntax-highlighted diff output
- 📊 Includes file statistics and change summaries
- 🔍 Automatic exclusion of common build artifacts and sensitive files
- 📁 Creates an organized directory structure with an index
- 💡 Support for comparing specific commits, branches, or tags
- 🚀 Progress indicators for long-running operations

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

## Excluded Files

The tool automatically excludes common files that typically don't need diff review:

- Package manager locks (package-lock.json, yarn.lock, etc.)
- Dependencies (node_modules/, vendor/)
- Build outputs (dist/, build/, .next/, etc.)
- IDE and OS files (.idea/, .vscode/, .DS_Store, etc.)
- Logs and debug files
- Environment and secret files
- Minified files

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

1. **Git command failed**
   - Ensure you're in a git repository
   - Verify git is installed and accessible from command line

2. **Permission errors**
   - Check write permissions in the output directory
   - Run with appropriate privileges

3. **Memory issues with large repositories**
   - Tool uses a 10MB buffer for git operations
   - Consider using specific commit ranges instead of full history

### Getting Help

- Open an issue on GitHub for bugs
- Start a discussion for feature requests
- Check existing issues before creating new ones

## Roadmap

Future improvements under consideration:

- [ ] Custom output directory option
- [ ] HTML export option
- [ ] Integration with CI/CD pipelines
- [ ] Custom exclusion patterns
- [ ] Multiple diff format support
- [ ] Interactive mode for file selection