import { localStorageStore } from './localstorage.store';
import { writable, type Writable } from 'svelte/store';
import { SafeService } from '../safe.service';
import { hasKey } from './key.store';

export const safe_addresses = localStorageStore('safe_addresses', '');
export const safe_store = writable<Record<string, Writable<SafeService>>>({});
export const hasAvatar = writable(false);
export const chain_array = ['base','gnosis'];

export const clearSafeStore = () => {
    safe_store.set({});
    safe_addresses?.set('')
}

export const formatSafeAddress = (chain: string, address: string) : string => {
    const c = chain == "gnosis" ? "gno" : chain;
    return c + ":" + address;
} 

export const parseSafeAddress = (address: string) : any => {

    let arr = address.split(':');
    return {
        chain : arr[0],
        address : arr[1]
    }
}

export const addSafe = async (chain: string) : Promise<void> => {

    const key = await hasKey()

    if(typeof key == "string") {

        const srv = await SafeService.create(chain, key, "0x");

        const prefixed_address = formatSafeAddress(chain, srv.safe_address);

        safe_store.update((safes) => { 
            safes[prefixed_address] = writable(srv); 
            return safes; 
        });

        if (safe_addresses) {
            safe_addresses.update((addresses) => {
                if (!addresses.includes(prefixed_address)) {
                    addresses = [...addresses, prefixed_address];
                }
                return addresses;
            });
        }
    } 
}   

export const addSafeAddress = async (_address: string) : Promise<void> => {

    if (safe_addresses) {
        safe_addresses.update((addresses) => {
            if (!addresses.includes(_address)) {

                const { chain, address} = parseSafeAddress(_address);

                if (chain == "base") {           
                    const i = addresses.indexOf("base:0x");
                    if (i > 0) { addresses.splice(i, 1); }
                }

                addresses = [...addresses, _address]; 
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

export const hasGnosisSafeAddress = (): Promise<string|false> => {
    return new Promise((resolve, reject) => {
        if (safe_addresses) {
            safe_addresses.subscribe((arr: string[]) => {
                if (Array.isArray(arr)) {
                    const a = arr.find((a: string) => a.includes("gno"));
                    if (a) {
                    resolve(a)
                    }
                }
                resolve(false)
            });
        }
    })
}

export const findAddressByChain = (chain: string) : Promise<string|false> => {

    let prefix = (chain == "gnosis") ? "gno" : chain;

    return new Promise((resolve, reject) => {
        if (safe_addresses) {
            safe_addresses.subscribe((arr: string[]) => {
                if (Array.isArray(arr)) {
                    const a = arr.find((a: string) => a.includes(prefix));
                    if (a) {
                    resolve(a)
                    }
                }
                resolve(false)
            });
        }
    })
}

export const findSrvByChain = (chain: string) : Promise<SafeService|false> => {

    let prefix = (chain == "gnosis") ? "gno" : chain;

    return new Promise((resolve, reject) => {
        safe_store?.subscribe((store) => {
            if (store) {
                const a = Object.keys(store).find((a: string) => a.includes(prefix));
                if (a) {
                    store[a].subscribe((safeService) => {
                      resolve(safeService);
                    });
                  }
                resolve(false)
            }
        })
    })
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

export const safeWithCircles = async () => {
    const safe = await new Promise(resolve => {
        safe_store.subscribe(async (safeService) => {
            resolve(safeService);
        });
    });
    return safe;
}
