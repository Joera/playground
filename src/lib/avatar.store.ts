import { localStorageStore } from './localstorage.store';
import { fromStore, writable, type Writable } from 'svelte/store';
import { SafeService } from './safe.service';
import { hasKey } from './key.store';
import { Sdk, type Avatar } from '@circles-sdk/sdk';
import { PrivateKeyContractRunner } from '@circles-sdk/adapter-ethers';
import { GnosisChainConfig } from './circles.factory';
import { getProvider, getRPC } from './eth.factory';
import { safe_store } from './safe.store';
import { SafeSdkPrivateKeyContractRunner } from '@circles-sdk/adapter-safe';

export const avatar_address = writable('');
export const avatar_store: Writable<Record<string, any>> = writable({});
export const circles_sdk_store: Writable<Record<string, any>> = writable({});

export const setAvatar = async (safe_address: string) : Promise<void> => {

    const key = await hasKey();

    if (key && typeof key == "string") {

        const provider = getProvider("gno", "");
        // either this or in service
        const adapter = new SafeSdkPrivateKeyContractRunner(key, getRPC("gno", ""));
        await adapter.init(safe_address);
        const circles_sdk = new Sdk(adapter, GnosisChainConfig);

        const safeServiceStore: any = await fromStore(safe_store);
        let avatar = null 
        try {
            avatar = await circles_sdk.getAvatar(safe_address);
            // console.log("avatar", avatar)
        } catch (error) {
            console.log(error)
        }

        circles_sdk_store.update( async (store: any) => { 
            
            store[safe_address] = circles_sdk;
            return store;
        });
        
        
        avatar_store.update( async (store: any) => { 
            
            store[safe_address] = avatar
            return store;
        });
       
    }
}   

