import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !p.includes('node_modules') &&
      !p.includes('__tests__') &&
      !p.includes('dist')
    ) {
      files.push(...walk(p));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(p);
    }
  }
  return files;
}

const srcFiles = walk(path.join(__dirname, 'src'));
let found = 0;

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/(?:from|require)\s+'([^']+)'/);
    if (match) {
      const spec = match[1];
      if (
        spec.startsWith('.') &&
        !spec.endsWith('.js') &&
        !spec.endsWith('.json') &&
        !spec.endsWith('.node')
      ) {
        const rel = path.relative(path.join(__dirname, 'src'), file).replace(/\\/g, '/');
        console.log(rel + ':' + (i + 1) + ': ' + spec);
        found++;
      }
    }
  }
}

if (found === 0) {
  console.log('No missing .js extensions found');
} else {
  console.log('\nTotal: ' + found + ' imports without .js extension');
}
