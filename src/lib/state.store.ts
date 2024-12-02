import { writable, type Writable } from "svelte/store";

export const state: Writable<string> = writable("");
export const contacts_state: Writable<string> = writable("");