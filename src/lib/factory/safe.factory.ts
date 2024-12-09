import { writable } from "svelte/store";
import { fixSafeAddress } from "./eth.factory";
import { hasKey } from "../store/key.store";
import { SafeService } from "../safe.service";
import { hasSafeAddresses, safe_store, hasAvatar, circles_addresses, chain_array, safe_addresses } from "../store/safe.store";
import { updateContacts } from "./contact.factory";

export const initSafeServices = async () => {

    const keyExists = await hasKey();
    const safe_array = await hasSafeAddresses();
    let safe = safe_array[0] || "0x";

    if (typeof keyExists == "string" && keyExists) {
       
        let i = 0;
        for (let chain of chain_array) {

            // safe = fixSafeAddress(safe);

            // how to flo the safe address when is initialiy "0x" .. 
            // then when will it set the safe adresses store
            // for black strip to update 
            // do all methods work after? 

            SafeService.create(chain, keyExists, safe).then( async (safeService) => {

                // then update stores : 

                safe_addresses?.update((addresses) => {
                    if (!addresses.includes(safeService.safe_address)) {
                        addresses = [...addresses, safeService.safe_address];
                    }
                    return addresses;
                });

                console.log('creating safe srv for ', chain);
                safe_store.update((safes) => { 
                    safes[chain] = writable(safeService); 
                    return safes; 
                });

                if (await safeService.checkAvatar()) {
                    hasAvatar.update(() => true);
                    circles_addresses.update (addresses => [...addresses, safe]);
                } 
            });

            i++;
        }

        circles_addresses.update (addresses => {
            if (addresses.length == 0) {
                return [...addresses, safe_array[0]];
            }
            return addresses;
        });
    } 
};