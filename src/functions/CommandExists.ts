/*
	The MIT License (MIT)

	Copyright (c) 2019 Raphaël Thériault

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

import { fileExists } from '#functions/FileExists';
import { fromAsync, isErr, isOk } from '@sapphire/result';
import { execa } from 'execa';
import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { basename, dirname } from 'node:path';

const windows = process.platform === 'win32';

async function isExecutable(command: string): Promise<boolean> {
	const result = await fromAsync(() => access(command, constants.X_OK));

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
