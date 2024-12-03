import { writable, type Writable } from "svelte/store";

export const avatar_state: Writable<string> = writable("");
export const contacts_state: Writable<string> = writable("");
export const transfer_state: Writable<string> = writable("");