const fs = require("fs");
const path = require("path");

/**
 * Utility functions for file system operations related to diff generation
 * @namespace fsUtils
 */
const fsUtils = {
  /**
   * Cleans up and recreates the output directory
   * @param {string} outputDir - Path to the output directory
   * @throws {Error} If directory creation fails
   */
  cleanupOutputDir(outputDir) {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });
  },

  /**
   * Saves diff content for a file as markdown
   * @param {string} outputDir - Path to the output directory
   * @param {string} file - Original file path/name
   * @param {string} content - Markdown content to save
   * @throws {Error} If file creation fails
   */
  saveFile(outputDir, file, content) {
    const mdFilePath = path.join(outputDir, file + ".md");
    const mdFileDir = path.dirname(mdFilePath);
    fs.mkdirSync(mdFileDir, { recursive: true });
    fs.writeFileSync(mdFilePath, content);
  },

  /**
   * Writes the index file containing links to all diffs
   * @param {string} outputDir - Path to the output directory
   * @param {string} content - Markdown content for the index
   * @throws {Error} If file creation fails
   */
  writeIndexFile(outputDir, content) {
    fs.writeFileSync(path.join(outputDir, "DIFF_INDEX.md"), content);
  }
};

module.exports = fsUtils; 