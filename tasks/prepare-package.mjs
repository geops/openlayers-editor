import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const baseDir = dirname(fileURLToPath(import.meta.url));

function main() {
  const pkg = JSON.parse(readFileSync(join(baseDir, '../package.json')));

  // write out simplified package.json
  pkg.main = 'index.js';
  delete pkg.devDependencies;
  delete pkg.scripts;
  const data = JSON.stringify(pkg, null, 2);
  writeFileSync(join(baseDir, '../build/package.json'), data);

  // copy over license and readme
  writeFileSync(
    join(baseDir, '../build/LICENSE'),
    readFileSync(join(baseDir, '../README.md')),
  );

  writeFileSync(
    join(baseDir, '../build/README.md'),
    readFileSync(join(baseDir, '../README.md')),
  );
}

main();
