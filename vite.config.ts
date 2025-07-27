import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	// Set base path for GitHub Pages (replace 'albion-black-market' with your repo name)
	base: process.env.NODE_ENV === 'production' ? '/albion-black-market/' : '/'
});
