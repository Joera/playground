import type { Writable } from "svelte/store";
import { localStorageStore } from "./localstorage.store";

export const events: Writable<string> | undefined = localStorageStore('events', "[]");

