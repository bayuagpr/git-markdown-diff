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
 * @param {boolean} [options.lightMode=false] - Use light mode theme instead of dark
 * @param {string} [options.mode] - Comparison mode (pr, commit, tag)
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
  .option("--light-mode", "Use light mode theme instead of dark mode")
  .option("-m, --mode <mode>", "Comparison mode (pr, commit, tag)", "pr")
  .addHelpText('after', `
Examples:
  # Basic usage (current branch vs main)
  $ gitloom-diff

  # Compare branches (PR mode)
  $ gitloom-diff -s feature/awesome -e main

  # Compare tags (use -m tag for proper tag comparison)
  $ gitloom-diff -s v1.1.0 -e v1.0.0 -m tag

  # Compare commits (use -m commit for commit comparison)
  $ gitloom-diff -s abc123 -e def456 -m commit

  # Diff with custom output
  $ gitloom-diff -s main -e develop -o pr-diffs

Note:
  Mode (-m) affects how git compares the references:
  - pr: Uses double-dot (..) for PR/branch comparison
  - commit: Uses triple-dot (...) for commit comparison
  - tag: Uses triple-dot (...) for tag comparison`)
  .action(async (options) => {
    showBranding();
    
    const config = {
      outputDir: options.output,
      exclusions: options.exclude || [],
      darkMode: !options.lightMode,
      mode: options.mode
    };
    
    const differ = new GitLoomDiff(config);
    await differ.run(options.startRef, options.endRef);
  });

program.parse();