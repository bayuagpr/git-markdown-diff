class Config {
  constructor(options = {}) {
    this.outputDir = options.outputDir || "git-diffs";
    this.exclusions = options.exclusions || [];
    this.diffFormat = options.diffFormat || "diff"; // possible values: diff, unified, side-by-side
    this.darkMode = options.darkMode ?? true;
  }

  getExclusions() {
    const defaultExclusions = require('../constants/gitExclusions');
    return [...defaultExclusions, ...this.exclusions];
  }

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