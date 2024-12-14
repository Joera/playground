import { writable } from "svelte/store";
import { hasKey } from "../store/key.store";
import { SafeService } from "../safe.service";
import { hasSafeAddresses, safe_store, parseSafeAddress, formatSafeAddress, safe_addresses } from "../store/safe.store";
import { ethers } from "ethers";


const fixOldSafeAddresses = (safe_array: string[]) => {
    
    if (safe_array.filter((safe) => safe.includes(':')).length < 1) {

        const addressZero = safe_array[0];
        safe_array = [];
        safe_array.push("gno:" + ethers.getAddress(addressZero));
        safe_array.push("base:" + "0x");
    };

    safe_addresses?.set(safe_array);
    return safe_array;
}

export const initSafeServices = async () => {

    const keyExists = await hasKey();
    let safe_array = await hasSafeAddresses();

    safe_array = fixOldSafeAddresses(safe_array);

    if (typeof keyExists == "string" && keyExists) {
       
        await Promise.all(safe_array.map(async (safe) => {

            const {chain, address} = parseSafeAddress(safe);

            const safeService = await SafeService.create(chain, keyExists, address);

           // const safe_address = formatSafeAddress(chain, safeService.safe_address);
            // addSafeAddress(safe_address)
            
            safe_store.update((safes) => { 
                safes[chain] = writable(safeService); 
                return safes; 
            });

            // if (await safeService.checkAvatar()) {
            //     hasAvatar.update(() => true);
            //     circles_addresses.update (addresses => [...addresses, address]);
            // }
        }));

        // for (let safe of safe_array) {

        //     const { chain, address } = parseSafeAddress(safe);

        //     console.log('creating safe srv for ', chain, address);

        //     SafeService.create(chain, keyExists, address).then( async (safeService) => {

        //         const safe_address = formatSafeAddress(chain, safeService.safe_address);
        //         addSafeAddress(safe_address)
        //         console.log('created safe srv for ', chain, safe_address);
                
        //         safe_store.update((safes) => { 
        //             safes[chain] = writable(safeService); 
        //             return safes; 
        //         });

        //         if (await safeService.checkAvatar()) {
        //             hasAvatar.update(() => true);
        //             circles_addresses.update (addresses => [...addresses, address]);
        //         } 
        //     });

        //     i++;
        // }

        // circles_addresses.update (addresses => {
        //     if (addresses.length == 0) {
        //         const a = safe_array.find(safe => safe.includes("gno:"))
        //         if (a) {
        //             return [...addresses, a];
        //         } else {
        //             return addresses
        //         }
        //     }

        //     return addresses
        // });
    } 
};