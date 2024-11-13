export const ssr = false;
export const prerender = false;

import { error } from '@sveltejs/kit';
import { hasKey, initPK  } from '../lib/key.store';
import { SafeService, type ISafeService } from '$lib/safe.service';
import { writable } from 'svelte/store';
import { safe_store, hasSafeAddresses } from '../lib/safe.store';


/** @type {import('./$types').PageLoad} */
export const load = async () => {

    const keyExists = await hasKey();
    const safe_array = await hasSafeAddresses();

    if (typeof keyExists == "string" && keyExists && safe_array.length > 0) {
        
        for (let safe of safe_array) {
            
            SafeService.create(keyExists, safe).then((safeService) => {
                safe_store.update((safes) => { 
                    safes[safe] = writable(safeService); 
                    return safes; 
                });
            });
        }

    } 
    //else if (typeof keyExists == "string") {
    //     safe_store.update((safes) => { 
    //         safes["0x"] = writable(new SafeService(keyExists, "0x")); 
    //         return safes; 
    //     });
    // }    

    return {
        safe_array,
        keyExists, 
    };
}

