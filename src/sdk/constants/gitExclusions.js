/**
 * Default file patterns to exclude from git diff generation.
 * Used by GitLoomDiff to filter out files that typically don't need diffing.
 * 
 * Includes patterns for:
 * - Package manager lock files (package-lock.json, yarn.lock, etc)
 * - Dependency directories (node_modules, vendor)
 * - Build output directories (dist, build, out, etc)
 * - IDE and editor files (.idea, .vscode, project files)
 * - System files (.DS_Store)
 * - Log files (*.log, npm/yarn debug logs)
 * - Environment and secret files (.env, keys)
 * - Generated/minified files (*.min.js, source maps)
 */
const EXCLUSIONS = [
  // Package manager locks
  "package-lock.json",
  "yarn.lock", 
  "pnpm-lock.yaml",
  "npm-shrinkwrap.json",
  "package-lock.linux-x64.json",
  "package-lock.macos-arm64.json",
  "package-lock.windows-x64.json",
  // Dependencies
  "node_modules/**",
  "vendor/**",
  // Build outputs
  "dist/**",
  "build/**",
  "out/**",
  ".next/**",
  "coverage/**",
  ".nuxt/**",
  // IDE and OS files
  ".idea/**",
  ".vscode/**",
  "*.suo",
  "*.ntvs*",
  "*.njsproj",
  "*.sln",
  ".DS_Store",
  // Logs
  "*.log",
  "logs/**",
  "npm-debug.log*",
  "yarn-debug.log*",
  "yarn-error.log*",
  // Environment and secrets
  ".env*",
  "*.pem",
  "*.key",
  // Generated files
  "*.min.js",
  "*.min.css",
  "*.map"
];

module.exports = EXCLUSIONS;