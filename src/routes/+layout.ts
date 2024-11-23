export const ssr = false;
export const prerender = false;

import { error } from '@sveltejs/kit';
import { hasKey, initPK  } from '../lib/key.store';
import { SafeService, type ISafeService } from '$lib/safe.service';
import { writable } from 'svelte/store';
import { safe_store, hasSafeAddresses } from '../lib/safe.store';
import { setAvatar } from '$lib/avatar.store';
import { fixSafeAddress } from '$lib/eth.factory';

/** @type {import('./$types').PageLoad} */
export const load = async () => {

    const keyExists = await hasKey();
    const safe_array = await hasSafeAddresses();

    const circles_addresses: any[] = [];

    if (typeof keyExists == "string" && keyExists && safe_array.length > 0) {
        
        for (let safe of safe_array) {

            safe = fixSafeAddress(safe);
            
            SafeService.create(keyExists, safe).then( async (safeService) => {
                safe_store.update((safes) => { 
                    safes[safe] = writable(safeService); 
                    return safes; 
                });

                if (await safeService.hasAvatar()) {
                    circles_addresses.push(safe);
                }
            });
        }

        if (circles_addresses.length > 0) {
            await setAvatar(circles_addresses[0])
        } else {
            await setAvatar(safe_array[0])
        }
    } 
   
    return {
        safe_array,
        keyExists, 
    };
}

