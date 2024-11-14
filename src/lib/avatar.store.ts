import { localStorageStore } from './localstorage.store';
import { writable, type Writable } from 'svelte/store';
import { SafeService } from './safe.service';
import { hasKey } from './key.store';
import { Sdk, type Avatar } from '@circles-sdk/sdk';
import { PrivateKeyContractRunner } from '@circles-sdk/adapter-ethers';
import { GnosisChainConfig } from './circles.factory';
import { getProvider } from './eth.factory';

export const avatar_store: Writable<any> = writable({});

export const setAvatar = async (safe_address: string) : Promise<void> => {

    const key = await hasKey();

    if (key && typeof key == "string") {

        const provider = getProvider("gno", "");
        const adapter = new PrivateKeyContractRunner(provider, key);
        await adapter.init();
        const circles_sdk = new Sdk(adapter, GnosisChainConfig);
        avatar_store.update( async (a: Avatar) => a = await circles_sdk.getAvatar(key));
        console.log(avatar_store);
    }
}   

