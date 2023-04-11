import { templatesFolder } from '#constants';
import { fileExists } from '#functions/FileExists';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export async function CreateFileFromTemplate(
	template: string,
	target: string,
	config: any,
	params?: Record<string, string>,
	custom = false,
	component = false
) {
	const location = custom ? template : `${templatesFolder}${template}`;

	const output = {} as FileOutput;

	if (component) {
		const [config, templateContent] = await getComponentTemplateWithConfig(location);

		output.config = config;
		output.templateContent = templateContent;
	}

	output.templateContent ??= await readFile(location, 'utf8');

	if (!output.templateContent) {
		throw new Error(`Couldn't read the template file. Are you sure it exists, the name is correct, and the content is valid?`);
	}

	if (params) {
		for (const param of Object.entries(params)) {
			output.templateContent = output.templateContent.replaceAll(`{{${param[0]}}}`, param[1]);
		}
	}

	if (!output || (component && (!output.config || !output.config.category))) {
		throw new Error('Invalid template.');
	}

	const dir = component ? config.locations[output.config!.category] : null;
	const ta = component ? target.replace('%L%', dir) : target;

	if (await fileExists(ta)) {
		throw new Error('Component already exists');
	}

	await writeFileRecursive(ta, output.templateContent);

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

interface FileOutput {
	templateContent: string;
	config?: Record<string, string>;
}
