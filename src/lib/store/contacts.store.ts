import { writable, type Writable } from "svelte/store";
import { localStorageStore } from "./localstorage.store";

export const contacts: Writable<string> | undefined = localStorageStore('contacts', "");
export const friend_address: Writable<string> = writable("");
export const hidden_contacts: Writable<string> | undefined = localStorageStore('hidden', '[]');

export const mergedContacts: Writable<any[]> = localStorageStore('mergedContacts', '[]');
export const circlesStore: Writable<Map<string, any>> = localStorageStore('circlesStore', '{}');