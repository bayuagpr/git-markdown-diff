#!/usr/bin/env node

const { program } = require("commander");
const GitLoomDiff = require("../sdk/GitLoomDiff");
const pkg = require("../../package.json");

/**
 * Configures and runs the GitLoomDiff CLI program.
 * 
 * Command line options:
 * @param {string} [options.startRef] - Starting git reference (commit/branch/tag) to compare from
 * @param {string} [options.endRef] - Ending git reference to compare to
 * @param {string} [options.output=git-diffs] - Directory to output the diff files
 * @param {string[]} [options.exclude] - File patterns to exclude from the diff
 * @param {string} [options.format=diff] - Diff format:
 *   - 'diff': Traditional git diff format
 *   - 'unified': Unified diff format
 *   - 'side-by-side': Two column comparison view
 * @param {boolean} [options.lightMode=false] - Use light mode theme instead of dark
 * 
 * Default behavior:
 * - Compares current branch against 'main' if no refs provided
 * - Outputs to './git-diffs' directory
 * - Uses dark mode theme
 * - Shows traditional diff format
 * 
 * The program generates markdown files containing:
 * - Syntax highlighted code diffs
 * - File change statistics
 * - Commit history between refs
 * - Navigation links between files
 */

// Add this helper function
function isCommitHash(ref) {
  // Git commit hashes are 40 chars or abbreviated to at least 7 chars
  // and contain only hexadecimal characters
  return ref && /^[0-9a-f]{7,40}$/i.test(ref);
}

// Add this branding function
function showBranding() {
  console.log(`
🧶 GitLoom Diff v${pkg.version}
===============================
`);
}

program
  .name("gitloom-diff")
  .description("Generate markdown-formatted git diffs")
  .version(pkg.version)
  .option("-s, --start-ref <ref>", "Starting reference (commit hash, branch name, or tag)")
  .option("-e, --end-ref <ref>", "Ending reference (commit hash, branch name, or tag)")
  .option("-o, --output <dir>", "Output directory", "git-diffs")
  .option("--exclude <patterns...>", "Additional file patterns to exclude")
  .option("-f, --format <format>", "Diff format (diff, unified, side-by-side)", "diff")
  .option("--light-mode", "Use light mode theme instead of dark mode")
  .addHelpText('after', `
Examples:
  # Basic usage (current branch vs main)
  $ gitloom-diff

  # Compare branches
  $ gitloom-diff -s feature/awesome -e main

  # Compare tags
  $ gitloom-diff -s v1.1.0 -e v1.0.0

  # Side-by-side diff with custom output
  $ gitloom-diff -s main -e develop -o pr-diffs -f side-by-side

  # Compare commit hashes
  $ gitloom-diff -s 1234567890abcdef1234567890abcdef12345678 -e 0987654321fedcba0987654321fedcba09876543`)
  .action(async (options) => {
    showBranding();
    
    const config = {
      outputDir: options.output,
      exclusions: options.exclude || [],
      diffFormat: options.format,
      darkMode: !options.lightMode,
      // Auto-detect mode based on ref format
      mode: (isCommitHash(options.startRef) && isCommitHash(options.endRef)) ? 'commit' : 'pr'
    };
    
    const differ = new GitLoomDiff(config);
    await differ.run(options.startRef, options.endRef);
  });

program.parse();