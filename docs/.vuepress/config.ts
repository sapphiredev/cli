import { defineUserConfig } from 'vuepress';
import type { DefaultThemeOptions } from 'vuepress';
import { sidebar } from './configs';

export default defineUserConfig<DefaultThemeOptions>({
	lang: 'en-US',
	title: 'Sapphire CLI',
	description: 'A guide for the Sapphire CLI',
	themeConfig: {
		logo: '/images/logo.png',
		repo: 'https://github.com/sapphiredev/cli/tree/vuepress',
		locales: {
			'/': {
				sidebar: sidebar.en
			}
		}
	},
});
