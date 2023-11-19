import type { Config } from '#lib/types';
import { findFilesRecursivelyRegex } from '@sapphire/node-utilities';
import { Result } from '@sapphire/result';
import { accessSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * A regex that checks if the file ends in one of the following extensions:
 * - `.js`
 * - `.ts`
 * - `.mjs`
 * - `.cjs`
 * - `.mts`
 * - `.cts`
 */
const regexForFilesEndingWithJavaScriptLikeExtensions = /\.(m|c)?(?:j|c|t)s$/;

/**
 * A regex that checks if the file is a loader file
 */
const regexForLoaderFiles = new RegExp(`_load${regexForFilesEndingWithJavaScriptLikeExtensions.source}`);

/**
 * Generates loader file content
 * @param dir The directory to generate the loader for
 * @param targetDir The directory that the `_load.<ext>` file will be written to
 */
async function generateVirtualPieceLoader(dir: string, targetDir: string) {
	console.log(`Generating virtual piece loader for ${targetDir}`);

	const files: string[] = [];
	for await (const file of findFilesRecursivelyRegex(targetDir, regexForFilesEndingWithJavaScriptLikeExtensions)) {
		if (regexForLoaderFiles.test(file)) continue;
		files.push(relative(targetDir, file).replace(regexForFilesEndingWithJavaScriptLikeExtensions, '.$1js'));
	}

	console.log(`Found ${files.length} ${dir} files`);

	return `${files.map((file) => `import './${file}';`).join('\n')}\n`;
}

/**
 * Creates component loaders
 *
 * We wrap the bulk of this function in a {@link Result.fromAsync} so that if any of the file writing fails
 * that will bubble up as a failure overall.
 *
 * @param templateLocation The location of the template
 * @param targetDir The directory that the `_load.<ext>` file will be written to
 * @param config The config
 * @returns Whether the loaders were created successfully
 */
export async function CreateComponentLoaders(templateLocation: string, targetDir: string, config: Config) {
	const [, templateContent] = await getComponentTemplateWithConfig(templateLocation);

	return (
		await Result.fromAsync(async () => {
			const dirs = Object.entries<string>(config.locations)
				.filter(([key]) => key !== 'base')
				.map(([, value]) => value)
				.filter((dir) => Result.from(() => accessSync(targetDir.replace('%L%', dir))).isOk());

			for (const dir of dirs) {
				const dirInjectedTarget = targetDir.replace('%L%', dir);
				const target = join(targetDir, `_load.${config.projectLanguage}`);

				const content = `${templateContent}\n${await generateVirtualPieceLoader(dir, dirInjectedTarget)}`;
				await writeFileRecursive(target, content);
			}
		})
	).isOk();
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
