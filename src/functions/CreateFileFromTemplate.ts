import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { templatesFolder } from '#constants';

export async function CreateFileFromTemplate(
	template: string,
	target: string,
	config: any,
	params?: Record<string, string>,
	custom = false,
	component = false
) {
	const location = custom ? template : `${templatesFolder}${template}`;

	const output = {} as {
		f: string;
		c?: Record<string, string>;
	};

	if (component) {
		const [c, f] = await getComponentTemplateWithConfig(location);

		output.c = c;
		output.f = f;
	}

	output.f ??= await readFile(location, 'utf8');

	if (!output.f) {
		throw new Error("Can't read file.");
	}

	if (params) {
		for (const param of Object.entries(params)) {
			output.f = output.f.replaceAll(`{{${param[0]}}}`, param[1]);
		}
	}

	if (!output || (component && (!output.c || !output.c.category))) {
		throw new Error('Invalid template.');
	}

	const dir = component ? config.locations[output.c!.category] : null;
	const ta = component ? target.replace('%L%', dir) : target;

	if (existsSync(ta)) {
		throw new Error('Component already exists');
	}

	await writeFileRecursive(ta, output.f);

	return true;
}

async function getComponentTemplateWithConfig(path: string) {
	const file = await readFile(path, 'utf8');
	const fa = file.split(/---(\r\n|\r|\n|)/gm);
	return [JSON.parse(fa[0]), fa[2]];
}

async function writeFileRecursive(target: string, data: string) {
	const dir = dirname(resolve(target));

	await mkdir(dir, { recursive: true });

	return writeFile(resolve(target), data);
}
