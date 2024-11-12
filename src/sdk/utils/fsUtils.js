const fs = require("fs");
const path = require("path");

const fsUtils = {
  cleanupOutputDir(outputDir) {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });
  },

  saveFile(outputDir, file, content) {
    const mdFilePath = path.join(outputDir, file + ".md");
    const mdFileDir = path.dirname(mdFilePath);
    fs.mkdirSync(mdFileDir, { recursive: true });
    fs.writeFileSync(mdFilePath, content);
  },

  writeIndexFile(outputDir, content) {
    fs.writeFileSync(path.join(outputDir, "DIFF_INDEX.md"), content);
  }
};

module.exports = fsUtils; 