import { fromAsync, isErr } from '@sapphire/result';
import { access } from 'node:fs/promises';

export async function fileExists(filePath: string): Promise<boolean> {
	const result = await fromAsync(async () => access(filePath));

	if (isErr(result)) {
		return false;
	}

	return true;
}
