/*
	from https://github.com/raftario/command-exists
	edited for this project
*/

import { fromAsync, isErr, isOk } from '@sapphire/result';
import { execa } from 'execa';
import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { basename, dirname } from 'node:path';
import { fileExists } from './FileExists';

const windows = process.platform === 'win32';

async function isExecutable(command: string): Promise<boolean> {
	const result = await fromAsync(async () => access(command, constants.X_OK));

	return isErr(result);
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
		const resolvedDirname = `"${dirname(input)}"`;
		const resolvedBasename = `"${basename(input)}"`;
		return `${resolvedDirname}:${resolvedBasename}`;
	}

	return `"${input}"`;
}

async function commandExistsUnix(command: string, cleanCommand: string): Promise<boolean> {
	if (await fileExists(command)) {
		if (await isExecutable(command)) {
			return true;
		}
	}

	const result = await fromAsync(async () =>
		execa('command', ['-v', cleanCommand, '2>/dev/null', '&&', '{', 'echo', '>&1', `${cleanCommand};`, 'exit', '0;', '}'])
	);

	if (isOk(result)) {
		return Boolean(result.value.stdout);
	}

	return false;
}

const invalidWindowsCommandNameRegex = /[\x00-\x1f<>:"|?*]/;

async function commandExistsWindows(command: string, cleanCommand: string): Promise<boolean> {
	if (invalidWindowsCommandNameRegex.test(command)) {
		return false;
	}

	const result = await fromAsync(async () => execa('where', [cleanCommand]));

	if (isErr(result)) {
		return fileExists(command);
	}

	return true;
}

export function CommandExists(command: string) {
	const cleanCommand = clean(command);

	return windows ? commandExistsWindows(command, cleanCommand) : commandExistsUnix(command, cleanCommand);
}
