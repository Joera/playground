export const ssr = false;
export const prerender = false;

import { initApp } from '$lib/factory/app.factory';

/** @type {import('./$types').PageLoad} */


export const load = async () => {

    await initApp();
   
}


