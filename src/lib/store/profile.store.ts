import type { Writable } from "svelte/store";
import { localStorageStore } from "./localstorage.store";

export const profile_store: Writable<string> | undefined = localStorageStore('profile', "");

