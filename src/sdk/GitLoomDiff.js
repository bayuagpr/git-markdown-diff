const gitUtils = require('./utils/gitUtils');
const fsUtils = require('./utils/fsUtils');
const Config = require('./config/Config');

/**
 * GitLoomDiff generates markdown-formatted git diffs with syntax highlighting and statistics.
 * Handles comparing git references (commits/branches/tags) and outputting formatted markdown files.
 */
class GitLoomDiff {
  /**
   * Creates a new GitLoomDiff instance with the provided configuration options.
   * @param {Object} options - Configuration options
   * @param {string} [options.outputDir='git-diffs'] - Directory to output the diff files
   * @param {string[]} [options.exclude=[]] - File patterns to exclude from the diff
   * @param {string} [options.format='diff'] - Diff format (diff, unified, side-by-side)
   * @param {boolean} [options.darkMode=true] - Whether to use dark mode theme
   * @param {string} [options.mode='pr'] - Diff mode ('pr', 'commit', or 'tag')
   */
  constructor(options = {}) {
    this.config = new Config(options);
  }

  /**
   * Runs the diff generation process.
   * @param {string} startRange - Starting git reference (commit/branch/tag)
   * @param {string} endRange - Ending git reference to compare against
   * @returns {Promise<void>}
   * @throws {Error} If git validation fails or diff generation encounters an error
   */
  async run(startRange, endRange) {
    const { default: ora } = await import("ora");
    const spinner = ora("Generating markdown diffs...").start();

    try {
      await gitUtils.validateGit();
      
      // Add remote fetch handling
      spinner.text = "Fetching latest remote changes...";
      await this.#fetchRemoteChanges(startRange, endRange);
      
      fsUtils.cleanupOutputDir(this.config.outputDir);
      
      const range = this.#buildGitRange(startRange, endRange);
      
      spinner.text = "Getting list of changed files...";
      const changedFiles = await gitUtils.getChangedFiles(range, this.config.getExclusions());
      const totalStats = await gitUtils.getTotalStats(range);
      
      const index = await this.#buildIndexContent(startRange, endRange, totalStats, range);
      await this.#processFiles(changedFiles, range, spinner, index);
      
      spinner.text = "Writing index file...";
      fsUtils.writeIndexFile(this.config.outputDir, index.join("\n"));
      
      spinner.succeed(`Diffs saved to ${this.config.outputDir}/`);
      
      // Add summary of generated content
      console.log('\nGenerated content:');
      console.log(`- Index file: ${this.config.outputDir}/DIFF_INDEX.md`);
      console.log(`- Total files processed: ${changedFiles.length}`);
      console.log(`- Files generated:`);
      console.log(`  ${this.config.outputDir}/`);
      console.log(`  ├── DIFF_INDEX.md`);
      changedFiles.forEach((file, i) => {
        const prefix = i === changedFiles.length - 1 ? '  └──' : '  ├──';
        console.log(`${prefix} ${file}.md`);
      });
    } catch (error) {
      spinner.fail("Failed to generate diffs");
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * Processes each changed file to generate diffs and update the index.
   * @param {string[]} changedFiles - List of files that have changes
   * @param {string} range - Git range to compare
   * @param {Object} spinner - Progress spinner instance
   * @param {string[]} index - Index content array to update
   * @returns {Promise<void>}
   * @private
   */
  async #processFiles(changedFiles, range, spinner, index) {
    for (let i = 0; i < changedFiles.length; i++) {
      const file = changedFiles[i];
      spinner.text = `Processing file ${i + 1}/${changedFiles.length}: ${file}`;
      
      const fileInfo = await gitUtils.getFileInfo(file, range);
      const content = await this.#generateFileContent(file, range, fileInfo);
      
      fsUtils.saveFile(this.config.outputDir, file, content);
      this.#updateIndex(index, file, fileInfo);
    }
  }

  /**
   * Builds a git range string from start and end references.
   * @param {string} startRange - Starting reference
   * @param {string} endRange - Ending reference
   * @returns {string} Formatted git range or empty string if no range provided
   * @private
   */
  #buildGitRange(startRange, endRange) {
    if (!startRange || !endRange) return "";
    
    return this.config.mode === 'pr' 
      ? `${endRange}..${startRange}`   // For PR branches: target..source
      : `${startRange}...${endRange}`; // For commit hashes: start...end
  }

  /**
   * Builds the content for the index markdown file.
   * @param {string} startRange - Starting reference
   * @param {string} endRange - Ending reference
   * @param {string} totalStats - Total change statistics
   * @returns {Promise<string[]>} Array of index content lines
   * @private
   */
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

  /**
   * Generates the markdown content for a single file's diff.
   * @param {string} file - File path
   * @param {string} range - Git range to compare
   * @param {string} fileInfo - File change statistics
   * @returns {Promise<string>} Generated markdown content
   * @private
   */
  async #generateFileContent(file, range, fileInfo) {
    const diffOutput = await gitUtils.getFileDiff(file, range, this.config.diffFormat);

    return [
      this.config.getCssStyle(),
      `Auto-generated by GitLoom Diff at ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}`,
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

  /**
   * Updates the index content with a link to a processed file.
   * @param {string[]} index - Index content array to update
   * @param {string} file - File path
   * @param {string} fileInfo - File change statistics
   * @private
   */
  #updateIndex(index, file, fileInfo) {
    const stats = fileInfo.match(/(\d+) insertion.+(\d+) deletion/)?.[0] || "No changes";
    index.push(`- [${file}](./${file}.md) - ${stats}`);
  }

  /**
   * Fetches latest changes from specified remote
   * @param {string} startRange - Starting git reference (commit/branch/tag)
   * @param {string} endRange - Ending git reference to compare against
   * @returns {Promise<void>}
   * @throws {Error} If git fetch fails
   */
  async #fetchRemoteChanges(startRange, endRange) {
    const remotes = new Set([
      await gitUtils.getRemote(startRange),
      await gitUtils.getRemote(endRange)
    ].filter(Boolean));

    for (const remote of remotes) {
      await gitUtils.fetchRemote(remote);
    }
  }
}

module.exports = GitLoomDiff; 