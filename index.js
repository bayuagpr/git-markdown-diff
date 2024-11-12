#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const { program } = require("commander");

class GitMarkdownDiff {
  constructor(outputDir = "git-diffs") {
    this.outputDir = outputDir;
  }

  async validateGit() {
    try {
      await execAsync("git status");
      return true;
    } catch (error) {
      console.error("Git command did not succeed. Script cannot proceed.");
      process.exit(1);
    }
  }

  cleanupOutputDir() {
    if (fs.existsSync(this.outputDir)) {
      fs.rmSync(this.outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  async run(startRange, endRange) {
    const { default: ora } = await import("ora");
    const spinner = ora("Generating markdown diffs...").start();

    try {
      await this.validateGit();
      this.cleanupOutputDir();

      spinner.text = "Getting list of changed files...";
      const range = startRange && endRange ? `${startRange}..${endRange}` : "";
      const exclusions = [
        // Package manager locks
        ":!package-lock.json",
        ":!yarn.lock",
        ":!pnpm-lock.yaml",
        ":!npm-shrinkwrap.json",
        ":!package-lock.linux-x64.json",
        ":!package-lock.macos-arm64.json",
        ":!package-lock.windows-x64.json",
        // Dependencies
        ":!node_modules/*",
        ":!vendor/*",
        // Build outputs
        ":!dist/*",
        ":!build/*",
        ":!out/*",
        ":!.next/*",
        ":!coverage/*",
        ":!.nuxt/*",
        // IDE and OS files
        ":!.idea/*",
        ":!.vscode/*",
        ":!*.suo",
        ":!*.ntvs*",
        ":!*.njsproj",
        ":!*.sln",
        ":!.DS_Store",
        // Logs
        ":!*.log",
        ":!logs/*",
        ":!npm-debug.log*",
        ":!yarn-debug.log*",
        ":!yarn-error.log*",
        // Environment and secrets
        ":!.env*",
        ":!*.pem",
        ":!*.key",
        // Generated files
        ":!*.min.js",
        ":!*.min.css",
        ":!*.map",
      ].join(" ");

      const { stdout: filesOutput } = await execAsync(
        `git diff ${range} --name-only -- . ${exclusions}`,
        { maxBuffer: 10 * 1024 * 1024 }
      );

      const changedFiles = filesOutput.split("\n").filter(Boolean);

      const { stdout: totalStats } = await execAsync(
        `git diff ${range} --shortstat`
      );
      let index = [
        "# Git Diff Summary\n",
        `> Comparing ${startRange || "current"} to ${
          endRange || "working tree"
        }\n`,
        `## Total Changes Stats\n\`\`\`\n${totalStats}\`\`\`\n`,
        "## Commit Messages\n",
      ];

      // Add commit messages if a range is specified
      if (startRange && endRange) {
        const { stdout: commitMessages } = await execAsync(
          `git log --pretty=format:"- %s (%h)" ${startRange}..${endRange}`
        );
        index.push(commitMessages + "\n\n## Changed Files\n");
      } else {
        index.push("## Changed Files\n");
      }

      // Process files sequentially to maintain order
      for (let i = 0; i < changedFiles.length; i++) {
        const file = changedFiles[i];
        spinner.text = `Processing file ${i + 1}/${
          changedFiles.length
        }: ${file}`;

        // Get file metadata
        const { stdout: fileInfo } = await execAsync(
          `git diff ${range} --stat -- "${file}"`,
          { maxBuffer: 10 * 1024 * 1024 }
        );

        const diffOutput = await execAsync(`git diff ${range} -- "${file}"`, {
          maxBuffer: 10 * 1024 * 1024,
        });

        const cssStyle = `
<!--
<style>
.markdown-body .highlight pre, .markdown-body pre {
  background-color: #0d1117;
}
.markdown-body .diff-deletion {
  color: #f85149;
  background-color: #3c1618;
}
.markdown-body .diff-addition {
  color: #56d364;
  background-color: #1b4721;
}
</style>
-->`;

        const content = [
          cssStyle,
          `generated at ${new Date().toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`,
          "",
          `# Changes in \`${file}\``,
          "",
          "## File Statistics",
          "```",
          fileInfo,
          "```",
          "",
          "## Changes",
          `\`\`\`diff`,
          diffOutput.stdout,
          "```",
          "",
          "",
        ].join("\n");

        // Create directory structure and save file
        const mdFilePath = path.join(this.outputDir, file + ".md");
        const mdFileDir = path.dirname(mdFilePath);

        fs.mkdirSync(mdFileDir, { recursive: true });
        fs.writeFileSync(mdFilePath, content);

        // Enhanced index entry with stats
        const stats =
          fileInfo.match(/(\d+) insertion.+(\d+) deletion/)?.[0] ||
          "No changes";
        index.push(`- [${file}](./${file}.md) - ${stats}`);
      }

      spinner.text = "Writing index file...";
      fs.writeFileSync(
        path.join(this.outputDir, "README.md"),
        index.join("\n")
      );

      spinner.succeed(`Diffs saved to ${this.outputDir}/`);
    } catch (error) {
      spinner.fail("Failed to generate diffs");
      console.error(error);
      process.exit(1);
    }
  }
}

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
