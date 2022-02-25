import { fromAsync, isOk } from '@sapphire/result';
import { access } from 'node:fs/promises';

export async function fileExists(filePath: string): Promise<boolean> {
	const result = await fromAsync(() => access(filePath));

	return isOk(result);
}
