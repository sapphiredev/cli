import type { SidebarConfig } from '@vuepress/theme-default';

export const en: SidebarConfig = {
	'/guide/': [{
		text: 'Guide',
		children: [
			'/guide/README.md',
			'/guide/getting-started.md',
			'/guide/existing-project.md',
			'/guide/generating-components.md',
			'/guide/custom-templates.md'
		]
	}]
}
