export const ssr = false;
export const prerender = false;

import { initApp } from '$lib/factory/app.factory';
import { hasKey, signer_key } from '$lib/store/key.store';


/** @type {import('./$types').PageLoad} */


export const load = async () => {

    console.log('layout 1')
    if(await hasKey()) {
        await initApp();
    }
    console.log('layout 2')
    
   
}   


