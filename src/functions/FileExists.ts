import { Result } from '@sapphire/result';
import { access } from 'node:fs/promises';

export async function fileExists(filePath: string): Promise<boolean> {
	const result = await Result.fromAsync(() => access(filePath));

	return result.isOk();
}
