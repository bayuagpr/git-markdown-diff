const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

/**
 * Utility functions for git operations related to diff generation
 * @namespace gitUtils
 */
const gitUtils = {
  /**
   * Validates that git is installed and the current directory is a git repository
   * @returns {Promise<boolean>} True if git validation succeeds
   * @throws {Error} If git command fails, exits process with code 1
   */
  async validateGit() {
    try {
      await execAsync("git status");
      return true;
    } catch (error) {
      console.error("Git command did not succeed. Script cannot proceed.");
      process.exit(1);
    }
  },

  /**
   * Gets list of files changed between two git references
   * @param {string} range - Git range to compare (e.g. "main..feature")
   * @param {string[]} exclusions - Patterns of files to exclude
   * @returns {Promise<string[]>} Array of changed file paths
   * @throws {Error} If git command fails
   */
  async getChangedFiles(range, exclusions) {
    const excludePatterns = exclusions.map(pattern => `:(exclude)${pattern}`).join(' ');
    const { stdout: filesOutput } = await execAsync(
      `git diff ${range} --name-only -- . ${excludePatterns}`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    return filesOutput.split("\n").filter(Boolean);
  },

  /**
   * Gets total change statistics between two git references
   * @param {string} range - Git range to compare
   * @returns {Promise<string>} Summary of total insertions/deletions
   * @throws {Error} If git command fails
   */
  async getTotalStats(range) {
    const { stdout } = await execAsync(`git diff ${range} --shortstat`);
    return stdout;
  },

  /**
   * Gets change statistics for a specific file
   * @param {string} file - Path to the file
   * @param {string} range - Git range to compare
   * @returns {Promise<string>} Summary of file's insertions/deletions
   * @throws {Error} If git command fails
   */
  async getFileInfo(file, range) {
    const { stdout } = await execAsync(
      `git diff ${range} --stat -- "${file}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    return stdout;
  },

  /**
   * Gets the diff output for a specific file
   * @param {string} file - Path to the file
   * @param {string} range - Git range to compare
   * @returns {Promise<string>} Formatted diff output
   * @throws {Error} If git command fails
   */
  async getFileDiff(file, range) {
    const cmd = `git diff ${range} -- "${file}"`;
    const { stdout } = await execAsync(cmd, {
      maxBuffer: 10 * 1024 * 1024
    });
    return stdout;
  },

  /**
   * Gets commit messages between two git references
   * @param {string} endRange - Starting git reference
   * @param {string} startRange - Ending git reference
   * @returns {Promise<string>} Formatted commit messages
   * @throws {Error} If git command fails
   */
  async getCommitMessages(endRange, startRange) {
    const { stdout } = await execAsync(
      `git log --pretty=format:"- %s (%h)" ${endRange}..${startRange}`
    );
    return stdout;
  },

  /**
   * Fetches latest changes from specified remote
   * @param {string} remote - Remote name (e.g. 'origin')
   * @returns {Promise<void>}
   * @throws {Error} If git fetch fails
   */
  async fetchRemote(remote) {
    await execAsync(`git fetch ${remote}`);
  },

  /**
   * Checks if reference is a remote branch
   * @param {string} ref - Git reference to check
   * @returns {string|null} Remote name if remote branch, null otherwise
   */
  async getRemote(ref) {
    if (!ref) return null;
    
    try {
      const { stdout: remotes } = await execAsync('git remote');
      const remotesList = remotes.trim().split('\n');
      const remoteMatch = ref.match(/^([^/]+)\//);
      
      if (remoteMatch && remotesList.includes(remoteMatch[1])) {
        return remoteMatch[1];
      }

      const { stdout: remote } = await execAsync(`git config --get branch.${ref}.remote`);
      return remote.trim() || null;
    } catch {
      return null;
    }
  }
};

module.exports = gitUtils;