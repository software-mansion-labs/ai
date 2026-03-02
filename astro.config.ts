import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'AI Workbook',
			logo: {
				src: './public/favicon.svg',
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/software-mansion-labs/ai' }],
			sidebar: [
				{ label: 'Getting Started', slug: 'getting-started' },
				{ label: 'Becoming Productive', slug: 'becoming-productive' },
				{ label: 'Expanding Horizons', slug: 'expanding-horizons' },
			],
			components: {
				Footer: './src/components/Footer.astro',
			},
		}),
	],
});
