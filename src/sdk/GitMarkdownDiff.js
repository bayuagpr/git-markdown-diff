const gitUtils = require('./utils/gitUtils');
const fsUtils = require('./utils/fsUtils');
const EXCLUSIONS = require('./constants/gitExclusions');

class GitMarkdownDiff {
  constructor(outputDir = "git-diffs") {
    this.outputDir = outputDir;
  }

  async run(startRange, endRange) {
    const { default: ora } = await import("ora");
    const spinner = ora("Generating markdown diffs...").start();

    try {
      await gitUtils.validateGit();
      fsUtils.cleanupOutputDir(this.outputDir);
      
      const range = this.#buildGitRange(startRange, endRange);
      
      spinner.text = "Getting list of changed files...";
      const changedFiles = await gitUtils.getChangedFiles(range, EXCLUSIONS);
      const totalStats = await gitUtils.getTotalStats(range);
      
      const index = await this.#buildIndexContent(startRange, endRange, totalStats, range);
      await this.#processFiles(changedFiles, range, spinner, index);
      
      spinner.text = "Writing index file...";
      fsUtils.writeIndexFile(this.outputDir, index.join("\n"));

      spinner.succeed(`Diffs saved to ${this.outputDir}/`);
    } catch (error) {
      spinner.fail("Failed to generate diffs");
      console.error(error);
      process.exit(1);
    }
  }

  async #processFiles(changedFiles, range, spinner, index) {
    for (let i = 0; i < changedFiles.length; i++) {
      const file = changedFiles[i];
      spinner.text = `Processing file ${i + 1}/${changedFiles.length}: ${file}`;
      
      const fileInfo = await gitUtils.getFileInfo(file, range);
      const content = await this.#generateFileContent(file, range, fileInfo);
      
      fsUtils.saveFile(this.outputDir, file, content);
      this.#updateIndex(index, file, fileInfo);
    }
  }

  #buildGitRange(startRange, endRange) {
    return startRange && endRange ? `${endRange}..${startRange}` : "";
  }

  async #buildIndexContent(startRange, endRange, totalStats) {
    const index = [
      "# Git Diff Summary\n",
      `> Comparing ${startRange || "current"} to ${endRange || "working tree"}\n`,
      `## Total Changes Stats\n\`\`\`\n${totalStats}\`\`\`\n`,
      "## Commit Messages\n",
    ];

    if (startRange && endRange) {
      const commitMessages = await gitUtils.getCommitMessages(endRange, startRange);
      index.push(commitMessages + "\n\n## Changed Files\n");
    } else {
      index.push("## Changed Files\n");
    }
    
    return index;
  }

  async #generateFileContent(file, range, fileInfo) {
    const diffOutput = await gitUtils.getFileDiff(file, range);

    return [
      this.#getCssStyle(),
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
      diffOutput,
      "```",
      "",
      "",
    ].join("\n");
  }

  #getCssStyle() {
    return `<!--
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
  }

  #updateIndex(index, file, fileInfo) {
    const stats = fileInfo.match(/(\d+) insertion.+(\d+) deletion/)?.[0] || "No changes";
    index.push(`- [${file}](./${file}.md) - ${stats}`);
  }
}

module.exports = GitMarkdownDiff; 