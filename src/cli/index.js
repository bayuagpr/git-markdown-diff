#!/usr/bin/env node

const { program } = require("commander");
const GitMarkdownDiff = require("../sdk/GitMarkdownDiff");

program
  .name("git-markdown-diff")
  .description("Generate markdown-formatted git diffs")
  .option("-s, --start-ref <ref>", "Starting reference (commit hash, branch name, or tag)")
  .option("-e, --end-ref <ref>", "Ending reference (commit hash, branch name, or tag)")
  .option("-o, --output <dir>", "Output directory", "git-diffs")
  .option("--exclude <patterns...>", "Additional file patterns to exclude")
  .option("-f, --format <format>", "Diff format (diff, unified, side-by-side)", "diff")
  .option("--light-mode", "Use light mode theme instead of dark mode")
  .action(async (options) => {
    const config = {
      outputDir: options.output,
      exclusions: options.exclude || [],
      diffFormat: options.format,
      darkMode: !options.lightMode
    };
    
    const differ = new GitMarkdownDiff(config);
    await differ.run(options.startRef, options.endRef);
  });

program.parse();