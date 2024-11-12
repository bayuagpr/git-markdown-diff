#!/usr/bin/env node

const { program } = require("commander");
const GitMarkdownDiff = require("../sdk/GitMarkdownDiff");

// CLI setup
program
  .name("git-markdown-diff")
  .description("Generate markdown-formatted git diffs")
  .argument(
    "[startRef]",
    "Starting reference (commit hash, branch name, or tag)"
  )
  .argument("[endRef]", "Ending reference (commit hash, branch name, or tag)")
  .action(async (startRef, endRef) => {
    const differ = new GitMarkdownDiff();
    await differ.run(startRef, endRef);
  });

program.parse(); 