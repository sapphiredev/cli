/*
	from https://github.com/raftario/command-exists
	edited for this project
*/

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const windows = process.platform === 'win32';

function fileExists(command: string): Promise<boolean> {
	return new Promise((res) => fs.access(command, (err) => res(!err)));
}

function executable(command: string): Promise<boolean> {
	return new Promise((res) => fs.access(command, fs.constants.X_OK, (err) => res(!err)));
}

function clean(input: string) {
	if (windows) {
		if (/[^A-Za-z0-9_\/:=-]/.test(input)) {
			input = `'${input.replace(/'/g, "'\\''")}'`;
			input = input.replace(/^(?:'')+/g, '').replace(/\\'''/g, "\\'");
		}

		return input;
	}
	if (/[\\]/.test(input)) {
		const dirname = `"${path.dirname(input)}"`;
		const basename = `"${path.basename(input)}"`;
		return `${dirname}:${basename}`;
	}

	return `"${input}"`;
}

function commandExistsUnix(command: string, cleanCommand: string): Promise<boolean> {
	return new Promise((res) => {
		return fileExists(command).then((exists) => {
			if (!exists) {
				exec(`command -v ${cleanCommand} 2>/dev/null && { echo >&1 ${cleanCommand}; exit 0; }`, (_err, stdout) => res(Boolean(stdout)));
			} else void executable(command).then((exists) => res(exists));
		});
	});
}

function commandExistsWindows(command: string, cleanCommand: string): Promise<boolean> {
	return new Promise((res) => {
		if (/[\x00-\x1f<>:"|?*]/.test(command)) res(false);
		exec(`where ${cleanCommand}`, (err) => {
			if (err) {
				void fileExists(command).then((exists) => res(exists));
			} else res(true);
		});
	});
}

export function CommandExists(command: string) {
	const cleanCommand = clean(command);

	return windows ? commandExistsWindows(command, cleanCommand) : commandExistsUnix(command, cleanCommand);
}
