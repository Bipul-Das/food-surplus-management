const fs = require('fs');
const path = require('path');

// The exact string required to bypass the alert block
const EXACT_COMMENT = '// Alert box. You can remove them safely.';

// Files passed by lint-staged
const files = process.argv.slice(2);
let hasError = false;

files.forEach((file) => {
  const content = fs.readFileSync(path.resolve(file), 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // If the line contains an alert invocation
    if (line.includes('alert(')) {
      // Check if it strictly includes the exact authorization comment
      if (!line.includes(EXACT_COMMENT)) {
        console.error(`\x1b[31m[BLOCKED] Unauthorized alert() detected in ${file} at line ${index + 1}\x1b[0m`);
        console.error(`\x1b[33mCode: ${line.trim()}\x1b[0m`);
        console.error(`\x1b[32mFix: Append the exact comment to the line: ${EXACT_COMMENT}\x1b[0m\n`);
        hasError = true;
      }
    }
  });
});

if (hasError) {
  console.error('\x1b[31mCommit aborted due to professionalism standard violation.\x1b[0m');
  process.exit(1); // Exits with an error code, completely blocking the git commit
}