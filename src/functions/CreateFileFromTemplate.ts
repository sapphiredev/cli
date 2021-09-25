import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export function CreateFileFromTemplate(
	template: string,
	target: string,
	config: any,
	params?: Record<string, string>,
	custom = false,
	component = false
) {
	return new Promise(async (resolve, reject) => {
		const location = custom ? template : `${__dirname}/../../templates/${template}`;

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

		if (!output.f) return reject(new Error("Can't read file."));
		if (params) {
			for (const param of Object.entries(params)) {
				output.f = output.f.replaceAll(`{{${param[0]}}}`, param[1]);
			}
		}

		if (!output || (component && (!output.c || !output.c.category))) return reject(new Error('Invalid template.'));
		const dir = component ? config.locations[output.c!.category] : null;
		const ta = component ? target.replace('%L%', dir) : target;

		if (existsSync(ta)) reject(new Error('Component already exists'));
		await writeFileRecursive(ta, output.f).catch(reject);

		return resolve(true);
	});
}

function getComponentTemplateWithConfig(path: string) {
	return readFile(path, 'utf8').then((file) => {
		const fa = file.split(/---(\r\n|\r|\n|)/gm);
		return [JSON.parse(fa[0]), fa[2]];
	});
}

function writeFileRecursive(target: string, data: string) {
	return new Promise(async (resolve, reject) => {
		const dir = path.dirname(path.resolve(target));
		await mkdir(dir, { recursive: true }).catch(reject);
		return writeFile(path.resolve(target), data).then(resolve).catch(reject);
	});
}
