import { localStorageStore } from './localstorage.store';
import { writable, type Writable } from 'svelte/store';
import { SafeService } from './safe.service';
import { hasKey } from './key.store';
import { fixSafeAddress, fixAddressArray } from './eth.factory';

export const safe_addresses = localStorageStore('safe_addresses', '');
export const safe_store = writable<Record<string, Writable<SafeService>>>({});

export const addSafe = async (index: number) : Promise<void> => {

    const key = await hasKey()

    if(typeof key == "string") {

        const srv = await SafeService.create(key, "");
        
        safe_store.update((safes) => { 
            safes[srv.safe_address] = writable(srv); 
            return safes; 
        });

        if (safe_addresses) {
            safe_addresses.update((addresses) => {
                if (!addresses.includes(srv.safe_address)) {
                    addresses = [...addresses, srv.safe_address];
                }
                return addresses;

            });
        }
    } 
}   

export const addSafeAddress = async (address: string) : Promise<void> => {

    if (safe_addresses) {
        safe_addresses.update((addresses) => {
            if (!addresses.includes(address)) {
                addresses = [...addresses, address]; 
            }
            return addresses;
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

export const waitForSubscriptions = async (safe_store: Record<string, Writable<SafeService>>, safesWithAvatars: string[])  => {

    for (const safe of Object.keys(safe_store)) {
        let b = await new Promise(resolve => {
            safe_store[safe].subscribe(async (safeService) => {
                const hasAvatar = await safeService.checkAvatar();
                resolve(hasAvatar);
            });
        });
        if (b) {
            safesWithAvatars.push(safe);
        }
    }

    return safesWithAvatars;
}

export const waitForSafeStoreToBePopulated = async (safe_store: Record<string, Writable<SafeService>>, safe_addresses: string[]) : Promise<void> => {
    return new Promise(resolve => {
        const intervalId = setInterval(() => {
            const safes = Object.keys(safe_store);
            if (safes.length === safe_addresses.length) {
                clearInterval(intervalId);
                resolve();
            }
        }, 100);
    });
}
