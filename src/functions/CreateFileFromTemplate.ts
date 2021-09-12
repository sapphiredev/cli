import { readFile, writeFile } from 'fs/promises';

export function CreateFileFromTemplate(template: string, target: string, params?: Record<string, string>, custom = false) {
	return new Promise(async (resolve, reject) => {
		const location = custom ? '' : `${__dirname}/../templates/`;

		let output = await readFile(`${location}${template}`, 'utf8');
		if (!output) return reject(new Error("Can't read file."));
		if (params) {
			for (const param of Object.entries(params)) {
				output = output.replaceAll(`{{${param[0]}}}`, param[1]);
			}
		}

		await writeFile(target, output).catch(reject);

		return resolve(true);
	});
}
