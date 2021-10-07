import { URL } from 'url';

export const rootFolder = new URL('../', import.meta.url);
export const templatesFolder = new URL('./templates/', rootFolder);
export const componentsFolder = new URL('./components/', templatesFolder);
export const repoUrl = 'https://github.com/sapphiredev/examples.git';
