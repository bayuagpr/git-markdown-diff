const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

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
  
    buildGitRange(startRange, endRange) {
      return startRange && endRange ? `${endRange}..${startRange}` : "";
    }
  
    async getChangedFiles(range, spinner) {
      spinner.text = "Getting list of changed files...";
      const exclusions = this.getExclusions();
      const { stdout: filesOutput } = await execAsync(
        `git diff ${range} --name-only -- . ${exclusions}`,
        { maxBuffer: 10 * 1024 * 1024 }
      );
      return filesOutput.split("\n").filter(Boolean);
    }
  
    getExclusions() {
      return [
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
    }
  
    async getTotalStats(range) {
      const { stdout } = await execAsync(`git diff ${range} --shortstat`);
      return stdout;
    }
  
    async buildIndexContent(startRange, endRange, totalStats, range) {
      const index = [
        "# Git Diff Summary\n",
        `> Comparing ${startRange || "current"} to ${endRange || "working tree"}\n`,
        `## Total Changes Stats\n\`\`\`\n${totalStats}\`\`\`\n`,
        "## Commit Messages\n",
      ];
  
      if (startRange && endRange) {
        const { stdout: commitMessages } = await execAsync(
          `git log --pretty=format:"- %s (%h)" ${endRange}..${startRange}`
        );
        index.push(commitMessages + "\n\n## Changed Files\n");
      } else {
        index.push("## Changed Files\n");
      }
      
      return index;
    }
  
    async processFiles(changedFiles, range, spinner, index) {
      for (let i = 0; i < changedFiles.length; i++) {
        const file = changedFiles[i];
        spinner.text = `Processing file ${i + 1}/${changedFiles.length}: ${file}`;
        
        const fileInfo = await this.getFileInfo(file, range);
        const content = await this.generateFileContent(file, range, fileInfo);
        
        await this.saveFile(file, content);
        this.updateIndex(index, file, fileInfo);
      }
    }
  
    async run(startRange, endRange) {
      const { default: ora } = await import("ora");
      const spinner = ora("Generating markdown diffs...").start();
  
      try {
        await this.validateGit();
        this.cleanupOutputDir();
        
        const range = this.buildGitRange(startRange, endRange);
        const changedFiles = await this.getChangedFiles(range, spinner);
        const totalStats = await this.getTotalStats(range);
        
        const index = await this.buildIndexContent(startRange, endRange, totalStats, range);
        await this.processFiles(changedFiles, range, spinner, index);
        
        spinner.text = "Writing index file...";
        fs.writeFileSync(path.join(this.outputDir, "DIFF_INDEX.md"), index.join("\n"));
  
        spinner.succeed(`Diffs saved to ${this.outputDir}/`);
      } catch (error) {
        spinner.fail("Failed to generate diffs");
        console.error(error);
        process.exit(1);
      }
    }
  
    async getFileInfo(file, range) {
      const { stdout } = await execAsync(
        `git diff ${range} --stat -- "${file}"`,
        { maxBuffer: 10 * 1024 * 1024 }
      );
      return stdout;
    }
  
    async generateFileContent(file, range, fileInfo) {
      const diffOutput = await execAsync(`git diff ${range} -- "${file}"`, {
        maxBuffer: 10 * 1024 * 1024,
      });
  
      return [
        this.getCssStyle(),
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
    }
  
    getCssStyle() {
      return `
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
    }
  
    async saveFile(file, content) {
      const mdFilePath = path.join(this.outputDir, file + ".md");
      const mdFileDir = path.dirname(mdFilePath);
      fs.mkdirSync(mdFileDir, { recursive: true });
      fs.writeFileSync(mdFilePath, content);
    }
  
    updateIndex(index, file, fileInfo) {
      const stats = fileInfo.match(/(\d+) insertion.+(\d+) deletion/)?.[0] || "No changes";
      index.push(`- [${file}](./${file}.md) - ${stats}`);
    }
  }

module.exports = GitMarkdownDiff; 