import { locationReplacement } from '#constants';
import type { Config } from '#lib/types';
import { findFilesRecursivelyRegex } from '@sapphire/node-utilities';
import { Result } from '@sapphire/result';
import { accessSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * Regular expression pattern for matching files ending with JavaScript-like extensions.
 * - `.js`
 * - `.ts`
 * - `.mjs`
 * - `.cjs`
 * - `.mts`
 * - `.cts`
 */
const regexForFilesEndingWithJavaScriptLikeExtensions = /\.([mc])?[jt]s$/;

/**
 * Regular expression used to match loader files.
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
 * @param targetDir The directory that the `_load.<ext>` file will be written to
 * @param config The config
 * @returns Whether the loaders were created successfully
 */
export async function CreateComponentLoaders(targetDir: string, config: Config) {
	const templateHeader = `// import this file in your entry point (index.${config.projectLanguage}) to load respective pieces`;

	return (
		await Result.fromAsync(async () => {
			const dirs = Object.entries<string>(config.locations)
				.filter(([key]) => key !== 'base')
				.map(([, value]) => value)
				.filter((dir) => Result.from(() => accessSync(injectDirIntoTargetDir(dir, targetDir))).isOk());

			for (const dir of dirs) {
				const dirInjectedTarget = injectDirIntoTargetDir(dir, targetDir);
				const target = join(targetDir, `_load.${config.projectLanguage}`);

				const content = `${templateHeader}\n${await generateVirtualPieceLoader(dir, dirInjectedTarget)}`;
				await writeFileRecursive(target, content);
			}
		})
	).isOk();
}

/**
 * Replaces the placeholder {@link locationReplacement} in the target directory with the specified directory.
 *
 * @param dir The directory to be injected into the target directory.
 * @param targetDir The target directory containing the placeholder {@link locationReplacement}.
 * @returns The target directory with the placeholder replaced by the specified directory.
 */
function injectDirIntoTargetDir(dir: string, targetDir: string) {
	return targetDir.replace(locationReplacement, dir);
}

/**
 * Writes data to a file recursively.
 *
 * @param target - The target file path.
 * @param data - The data to write to the file.
 * @returns A promise that resolves when the file is written.
 */
async function writeFileRecursive(target: string, data: string) {
	const resolvedTarget = resolve(target);
	const dir = dirname(resolvedTarget);

	await mkdir(dir, { recursive: true });

	return writeFile(resolvedTarget, data);
}
