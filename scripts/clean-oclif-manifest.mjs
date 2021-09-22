import { rm } from 'node:fs/promises';

const rootFolder = new URL('../', import.meta.url);
const oclifManifest = new URL('oclif.manifest.json', rootFolder);

const options = { recursive: true, force: true };

await Promise.all([rm(oclifManifest, options)]);
