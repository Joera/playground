export const ssr = false;
export const prerender = false;

import { hasKey  } from '../lib/key.store';
import { SafeService, type ISafeService } from '$lib/safe.service';
import { writable } from 'svelte/store';
import { safe_store, hasSafeAddresses, circles_addresses, hasAvatar } from '../lib/safe.store';
import { fixSafeAddress, hexToAddress } from '$lib/eth.factory';
import { ethers, getDefaultProvider } from 'ethers';
import { events } from '$lib/event.store';
import { initSafeServices } from '$lib/safe.factory';
import { setCirclesListener } from '$lib/circles.factory';
import { initApp } from '$lib/app.factory';

/** @type {import('./$types').PageLoad} */


export const load = async () => {

    await initApp();
   
}


