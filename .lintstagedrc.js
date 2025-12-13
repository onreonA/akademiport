/**
 * lint-staged Configuration
 *
 * Pre-commit hook'ta sadece değişen dosyaları lint/format eder
 */

module.exports = {
  // TypeScript ve JavaScript dosyaları
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // JSON dosyaları
  '*.json': ['prettier --write'],

  // Markdown dosyaları
  '*.md': ['prettier --write'],

  // CSS ve diğer stil dosyaları
  '*.{css,scss,sass}': ['prettier --write'],

  // YAML dosyaları
  '*.{yml,yaml}': ['prettier --write'],
};

