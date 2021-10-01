#!/usr/bin/env node

import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { URL } from 'url';

import newCmd from '#commands/new.js';
import generateCmd from '#commands/generate.js';

const __dirname = new URL('.', import.meta.url).pathname;

const sapphire = new Command();
const packageJson = JSON.parse(await readFile(`${__dirname}/../package.json`, 'utf8'));

sapphire.name('sapphire').version(packageJson.version);

sapphire
	.command('new')
	.description('creates a new Sapphire project')
	.alias('n')
	.argument('[name]', 'project name')
	.option('-v, --verbose')
	.action(newCmd);

sapphire
	.command('generate')
	.description('generates a component/piece')
	.alias('g')
	.argument('<component>', 'component/piece name')
	.argument('<name>', 'file name')
	.action(generateCmd);

sapphire.parse(process.argv);
