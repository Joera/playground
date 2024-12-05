import { writable, type Writable } from "svelte/store";

export const avatar_state: Writable<string> = writable("");
export const contacts_state: Writable<string> = writable("");
export const transfer_state: Writable<string> = writable("");
export const maintenance_state: Writable<string> = writable("");
export const profile_state : Writable<string> = writable("");
export const welcome_state : Writable<string> = writable("");
export const activity_state : Writable<string> = writable("");
export const safe_state : Writable<string> = writable("");