const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', 'src');
const exts = new Set(['.tsx', '.ts', '.jsx', '.js']);
const ignoreDirs = new Set(['node_modules', '.next', 'dist', 'build']);
const results = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (ignoreDirs.has(name)) continue;
      walk(full);
    } else if (exts.has(path.extname(name))) {
      const text = fs.readFileSync(full, 'utf8');
      const re = />\s*([^<{][^<]*?)\s*</g;
      let m;
      while ((m = re.exec(text))) {
        const content = m[1].trim();
        if (!content) continue;
        if (/^{.*}$/.test(content)) continue;
        if (content.match(/^\d+$/)) continue;
        if (content.length < 4) continue;
        if (content.includes('{') || content.includes('}')) continue;
        results.push({ file: full.replace(/\\/g, '/'), line: text.slice(0, m.index).split('\n').length, content });
      }
    }
  }
}

walk(root);
console.log(JSON.stringify(results, null, 2));
