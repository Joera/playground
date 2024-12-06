export const ssr = false;
export const prerender = false;

import { initApp } from '$lib/factory/app.factory';
import { hasKey, signer_key } from '$lib/store/key.store';

/** @type {import('./$types').PageLoad} */


export const load = async () => {

    if(await hasKey()) {
        await initApp();
    }
    
   
}


