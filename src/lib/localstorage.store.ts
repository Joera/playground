import { writable } from 'svelte/store';

export function localStorageStore(key: string, initialValue: string) {

    if (typeof window !== 'undefined') {
        
        const storedValue = localStorage.getItem(key);
        const data = storedValue ? JSON.parse(storedValue) : initialValue;
        const store = writable(data);
        store.subscribe(value => {
            localStorage.setItem(key, JSON.stringify(value));
        });

        return store;
    }
}

