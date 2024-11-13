import { localStorageStore } from './localstorage.store';
import { writable, type Writable } from 'svelte/store';
import { SafeService } from './safe.service';
import { hasKey } from './key.store';

export const safe_addresses = localStorageStore('safe_addresses', '');
export const safe_store = writable<Record<string, Writable<SafeService>>>({});

export const addSafe = async () : Promise<void> => {

    const key = await hasKey()

    if(typeof key == "string") {

        const srv = await SafeService.create(key, "");
        
        console.log(srv.safe_address);

        safe_store.update((safes) => { 
            safes[srv.safe_address] = writable(srv); 
            return safes; 
        });

        if (safe_addresses) {
            safe_addresses.update((addresses) => {
                if (!addresses.includes(srv.safe_address)) {
                    addresses.push(srv.safe_address);
                    return addresses;
                }
            });
        }
    }

    // something in ux for profile
    // get invite
    // register as human avatar
 
}   

export const addSafeAddress = async (address: string) : Promise<void> => {

    if (safe_addresses) {
        safe_addresses.update((addresses) => {
            if (!addresses.includes(address)) {
                addresses.push(address);
                return addresses;
            }
        });
    }
}

export const hasSafeAddresses = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        if (safe_addresses) {
            safe_addresses.subscribe((value: string | string[]) => {
                const b = typeof value != "string" ? value : [];
                resolve(b)
            });
        }
    })
}
