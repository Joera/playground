import type { Writable } from "svelte/store";
import { localStorageStore } from "./localstorage.store";


export const contacts: Writable<string> | undefined = localStorageStore('contacts', "");

