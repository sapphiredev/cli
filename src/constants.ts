import { URL, fileURLToPath } from 'url';

const rootURL = new URL('../', import.meta.url);
const templatesURL = new URL('./templates/', rootURL);
const componentsURL = new URL('./components/', templatesURL);

export const rootFolder = fileURLToPath(rootURL);
export const templatesFolder = fileURLToPath(templatesURL);
export const componentsFolder = fileURLToPath(componentsURL);
export const repoUrl = 'https://github.com/sapphiredev/examples.git';
export const locationReplacement = '{{LOCATION_REPLACEMENT}}';
