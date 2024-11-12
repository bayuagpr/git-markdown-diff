#!/usr/bin/env node

const { program } = require("commander");
const GitLoomDiff = require("../sdk/GitLoomDiff");

program
  .name("gitloom-diff")
  .description("Generate markdown-formatted git diffs")
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
  $ gitloom-diff -s main -e develop -o pr-diffs -f side-by-side`)
  .action(async (options) => {
    const config = {
      outputDir: options.output,
      exclusions: options.exclude || [],
      diffFormat: options.format,
      darkMode: !options.lightMode
    };
    
    const differ = new GitLoomDiff(config);
    await differ.run(options.startRef, options.endRef);
  });

program.parse();