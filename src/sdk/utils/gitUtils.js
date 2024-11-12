const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

const gitUtils = {
  async validateGit() {
    try {
      await execAsync("git status");
      return true;
    } catch (error) {
      console.error("Git command did not succeed. Script cannot proceed.");
      process.exit(1);
    }
  },

  async getChangedFiles(range, exclusions) {
    const { stdout: filesOutput } = await execAsync(
      `git diff ${range} --name-only -- . ${exclusions}`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    return filesOutput.split("\n").filter(Boolean);
  },

  async getTotalStats(range) {
    const { stdout } = await execAsync(`git diff ${range} --shortstat`);
    return stdout;
  },

  async getFileInfo(file, range) {
    const { stdout } = await execAsync(
      `git diff ${range} --stat -- "${file}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    return stdout;
  },

  async getFileDiff(file, range, format = 'diff') {
    const formatFlags = {
      'diff': '',
      'unified': ' -U3',
      'side-by-side': ' --side-by-side --width=180'
    };

    const flag = formatFlags[format] || '';
    const cmd = `git diff${flag} ${range} -- "${file}"`;
    const { stdout } = await execAsync(cmd, {
      maxBuffer: 10 * 1024 * 1024
    });
    return stdout;
  },

  async getCommitMessages(endRange, startRange) {
    const { stdout } = await execAsync(
      `git log --pretty=format:"- %s (%h)" ${endRange}..${startRange}`
    );
    return stdout;
  }
};

module.exports = gitUtils; 