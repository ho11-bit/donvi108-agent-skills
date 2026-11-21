import { writeFile } from 'node:fs/promises';
import { verifyReference, downloadBibtex } from '../docs/reference.mjs';

const [command, doi, argument, ...rest] = process.argv.slice(2);
try {
  if (rest.length || !doi || !['verify', 'bib'].includes(command)) {
    throw new Error('Usage: node examples/reference.mjs verify DOI ["Title"] | bib DOI [new-file.bib]');
  }
  if (command === 'verify') {
    console.log(JSON.stringify(await verifyReference(doi, argument), null, 2));
  } else {
    const bib = await downloadBibtex(doi);
    if (argument) await writeFile(argument, bib, { encoding:'utf8', flag:'wx' });
    else process.stdout.write(bib);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
