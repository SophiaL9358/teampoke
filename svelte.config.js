import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import node from '@sveltejs/adapter-node';

export default {
	kit: { 
		adapter: node()
	},

	preprocess: [vitePreprocess({})]
};
