
import axios from 'axios';

const KUBO_BASE_URL = import.meta.env.VITE_KUBO_BASE_URL;
const CLUSTER_BASE_URL = import.meta.env.VITE_CLUSTER_BASE_URL;
const VALIDATORS_BASE_URL = import.meta.env.VITE_VALIDATORS_BASE_URL;

// console.log(KUBO_BASE_URL, CLUSTER_BASE_URL)

export const kubo_api = axios.create({
    baseURL: KUBO_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000
});

export const cluster_api = axios.create({
    baseURL: CLUSTER_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000
});

export const validators_api = axios.create({
    baseURL: VALIDATORS_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000
});