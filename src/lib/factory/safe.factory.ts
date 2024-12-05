import { writable } from "svelte/store";
import { fixSafeAddress } from "./eth.factory";
import { hasKey } from "../store/key.store";
import { SafeService } from "../safe.service";
import { hasSafeAddresses, safe_store, hasAvatar, circles_addresses, chain_array } from "../store/safe.store";

export const initSafeServices = async () => {

    const keyExists = await hasKey();
    const safe_array = await hasSafeAddresses();
    let safe = safe_array[0];

    if (typeof keyExists == "string" && keyExists && safe_array.length > 0) {
        console.log('has safe address')
        let i = 0;
        for (let chain of chain_array) {

            safe = fixSafeAddress(safe);

            SafeService.create(chain, keyExists, safe).then( async (safeService) => {

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
                return [...addresses, fixSafeAddress(safe_array[0])];
            }
            return addresses;
        });
    } 
};