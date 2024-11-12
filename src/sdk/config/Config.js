/**
 * Configuration class for GitLoomDiff that manages output settings and styling
 * @class
 */
class Config {
  /**
   * Creates a new Config instance with the provided options
   * @param {Object} options - Configuration options
   * @param {string} [options.outputDir='git-diffs'] - Directory to output the diff files
   * @param {string[]} [options.exclusions=[]] - Additional file patterns to exclude from diff
   * @param {('diff'|'unified'|'side-by-side')} [options.diffFormat='diff'] - Format for git diff output
   * @param {boolean} [options.darkMode=true] - Whether to use dark mode styling
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || "git-diffs";
    this.exclusions = options.exclusions || [];
    this.diffFormat = options.diffFormat || "diff"; // possible values: diff, unified, side-by-side
    this.darkMode = options.darkMode ?? true;
  }

  /**
   * Gets combined list of default and custom file exclusion patterns
   * @returns {string[]} Array of file patterns to exclude from diff
   */
  getExclusions() {
    const defaultExclusions = require('../constants/gitExclusions');
    return [...defaultExclusions, ...this.exclusions];
  }

  /**
   * Gets CSS styles for dark mode markdown styling
   * @returns {string} CSS style block for dark mode or empty string if dark mode disabled
   */
  getCssStyle() {
    if (!this.darkMode) return '';
    
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
}

module.exports = Config;