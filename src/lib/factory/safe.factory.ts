// import { writable } from "svelte/store";
// import { hasKey } from "../store/key.store";
// import { SafeService } from "../safe.service";
// import { hasSafeAddresses, safe_store, parseSafeAddress, formatSafeAddress, safe_addresses } from "../store/safe.store";
// import { ethers } from "ethers";



// export const initSafeServices = async (safe_array: string[]) => {

//     const keyExists = await hasKey();
  
//     if (typeof keyExists == "string" && keyExists) {
       
//         await Promise.all(safe_array.map(async (safe) => {

//             const {chain, address} = parseSafeAddress(safe);

//             const safeService = await SafeService.create(chain, keyExists, address);
            
//             safe_store.update((safes) => { 
//                 safes[chain] = writable(safeService); 
//                 return safes; 
//             });
//         }));
// };