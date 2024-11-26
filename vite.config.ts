import { sveltekit } from '@sveltejs/kit/vite';
import NodeGlobalsPolyfillPlugin from 'vite-plugin-node-stdlib-browser';

import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(), 
		NodeGlobalsPolyfillPlugin({
			process: true,
			buffer: true
		}), 
	],
	define: {
		global: 'window', 
		'process.env': {},
	},
	resolve: {
		alias: {
			stream: 'stream-browserify',
            crypto: 'crypto-browserify',
            http: 'stream-http',
            https: 'https-browserify',
            os: 'os-browserify/browser',
            url: 'url',
			'es6-promise': 'es6-promise/auto'
		}
	},
	optimizeDeps: {
		include: ['buffer', 'stream', 'crypto']
	},
	server: {
		proxy: {
		  '/add': 'https://ipfs.transport-union.dev/api/v0',
		  '/cat': 'https://ipfs.transport-union.dev/api/v0', // or your target API URL
		  '/pin': 'https://pin.transport-union.dev/pins',
		},
	  },
});
