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
		'/kubo': {
			target: 'https://ipfs.transport-union.dev/api/v0',
			changeOrigin: true,
			rewrite: (path) => path.replace(/^\/kubo/, '') 
		},
		'/cluster': {
			target: 'https://pin.transport-union.dev',
			changeOrigin: true,
			rewrite: (path) => path.replace(/^\/cluster/, '')
		},
		'/rgntn': {
			target: 'https://validators.autonomous-times.com',
			changeOrigin: true,	
			rewrite: (path) => path.replace(/^\/rgntn/, '')
		},
		'/circles': {
			target: 'https://rpc.aboutcircles.com',
			changeOrigin: true,	
			rewrite: (path) => path.replace(/^\/circles/, '')
		},
		'/baserpc': {
			target: 'https://base-mainnet.g.alchemy.com',
			changeOrigin: true,	
			rewrite: (path) => path.replace(/^\/baserpc/, '')
		}
	  }
	}	
});
