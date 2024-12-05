import type { Writable } from "svelte/store";
import { localStorageStore } from "./localstorage.store";


export const activities: Writable<string> | undefined = localStorageStore('activities', "");

