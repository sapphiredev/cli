#!/usr/bin/env node

import { run } from '@oclif/command';
import oclifErrorHandler from '@oclif/errors/handle';
import flush from '@oclif/command/flush';

async function main() {
	try {
		await run();
		await flush();
	} catch (error) {
		oclifErrorHandler(error as Error);
	}
}

void main();
