import type { Config } from '#lib/types';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { lstatSync } from 'fs';
import { join, relative } from 'path';
import { templatesFolder } from '../constants.js';

/**
 * Returns an array of JS/TS files in a folder
 * @param {string} dir
 * @returns {string[]}
 */
async function getJSTSfiles(dir: string, baseDir = dir): Promise<string[]> {
	const files = await readdir(dir);
	const tsFiles = files.flatMap((file) => {
		const fullPath = join(dir, file);
		if (lstatSync(fullPath).isDirectory()) {
			return getJSTSfiles(fullPath, baseDir);
		}
		if (file.endsWith('.ts') || file.endsWith('.js')) {
			return relative(baseDir, fullPath);
		}
		return [];
	});
	return (await Promise.all(tsFiles).then((files) => files.flat()))
		.filter((file) => !file.includes('_load'))
		.map((file) => file.replace(/.ts|.js/gimu, ''))
		.sort();
}

/**
 * Generates loader file content
 * @param {string} dir
 */
async function generateVirtualPieceLoader(dir: string) {
	console.info(`Generating virtual piece loader for ${dir}`);
	const files = await getJSTSfiles(dir);
	console.info(`Found ${files.length} files`);
	return `${files.map((file) => `import './${file}';`).join('\n')}\n`;
}

export async function CreateComponentLoaders(target: string, config: Config | null) {
	if (!config) {
		throw new Error('There is no sapphire config. Please run `sapphire init` to create one.');
	}
	const location = `${templatesFolder}/_load`;
	const [, templateContent] = await getComponentTemplateWithConfig(location);

	const dirs = Object.values<string>(config.locations);
	dirs.map(async (dir) => {
		const content = `${templateContent}\n${await generateVirtualPieceLoader(dir)}`;
		return writeFileRecursive(target, content);
	});

	await Promise.all(dirs);

	return true;
}

/**
 * Gets the template and the config from a component template
 * @param path Path to the template
 * @returns [config, template] The config and the template
 */
async function getComponentTemplateWithConfig(path: string): Promise<[config: Record<string, string>, template: string]> {
	const file = await readFile(path, 'utf8');
	const fa = file.split(/---(\r\n|\r|\n|)/gm);
	return [JSON.parse(fa[0]), fa[2]];
}

/**
 * Writes a file recursively
 * @param target Target path
 * @param data Data to write
 */
async function writeFileRecursive(target: string, data: string) {
	const resolvedTarget = resolve(target);
	const dir = dirname(resolvedTarget);

	await mkdir(dir, { recursive: true });

	return writeFile(resolvedTarget, data);
}
