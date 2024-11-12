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