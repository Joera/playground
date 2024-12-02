export const ssr = false;
export const prerender = false;

import { hasKey  } from '../lib/key.store';
import { SafeService, type ISafeService } from '$lib/safe.service';
import { writable } from 'svelte/store';
import { safe_store, hasSafeAddresses, circles_addresses } from '../lib/safe.store';
// import { setAvatar } from '$lib/avatar.store';
import { fixSafeAddress, hexToAddress } from '$lib/eth.factory';
import type { Observable } from '@circles-sdk/data/dist/observable';
import { ethers, getDefaultProvider } from 'ethers';
import { events } from '$lib/event.store';

/** @type {import('./$types').PageLoad} */
export const load = async () => {


    // you neeed to repeat this when first safe has been prepared

    const keyExists = await hasKey();
    const safe_array = await hasSafeAddresses();

    if (typeof keyExists == "string" && keyExists && safe_array.length > 0) {
        
        let i = 0;
        for (let safe of safe_array) {

            safe = fixSafeAddress(safe);

            SafeService.create(keyExists, safe).then( async (safeService) => {
                safe_store.update((safes) => { 
                    safes[safe] = writable(safeService); 
                    return safes; 
                });

                if (await safeService.checkAvatar()) {
                    circles_addresses.update (addresses => [...addresses, safe]);
                } 
            });

            i++;
        }

        //  when empty add first array
        circles_addresses.update (addresses => {

            if (addresses.length == 0) {
                return [...addresses, fixSafeAddress(safe_array[0])];
            }
            return addresses;
        });

    } 

    let listening = false;


    circles_addresses.subscribe(async (addresses) => {

        if (!listening && addresses.length > 0) {


            safe_store.subscribe(async (stores) => {

                const safeService = (await stores)[addresses[0]];

                if (!safeService) return;

                safeService.subscribe(async (srv) => {

                    const provider = getDefaultProvider('wss://rpc.gnosischain.com/wss');
                 //   const wsProvider = new ethers.providers.WebSocketProvider("wss://rpc.gnosischain.com/");

                    const contractAddress = '0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8';
                    const contractABI = [
                        "event Trust(address indexed truster, address indexed trustee, uint256 expiryTime)"
                    ];

                    const contract = new ethers.Contract(contractAddress, contractABI, provider);

                    const filter = contract.filters.Trust(null, ethers.getAddress(addresses[0]), null);

                    contract.on(filter, async (event: any, log: any) => {

                        if (ethers.getAddress(event.log.address) != ethers.getAddress(contractAddress)) return;
                        
                        const truster = hexToAddress(event.log.topics[1])
                        console.log("trust detected from ", truster);
                        const name = await srv.getAvatarName(truster);

                        const e = {

                            msg : `${name} trusts you`,
                            url: '/avatar',
                            state: 'contacts'
                        }

                        events?.update((eventsString) => {
                            let events = eventsString != "" ? JSON.parse(eventsString) : [];
                            events = [...events, e]
                            return JSON.stringify(events);
                        });
                        
                    });

                    listening = true;
                    console.log('listening to events for ', addresses[0]);
                });
            });
        }
    });
   
    return {
        safe_array,
        keyExists, 
        circles_addresses
    };
}


