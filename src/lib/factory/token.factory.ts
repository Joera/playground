import type { Provider } from "ethers";


export interface IToken {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
    balance: string;
    mintable?: string;
    native: boolean
}

export interface ITokenService {

    provider: Provider
}

export const tokenList: Record<string, IToken[]> = {
    
    "gnosis":[
        {
            name: "xDAI",
            symbol: "xDAI",
            decimals: 18,   
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            balance: "0",
            native: true
        },  
        {
            name: "GNO",
            symbol: "GNO",
            decimals: 18,   
            address: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
            balance: "0",
            native: false
        }, 
        
        {
            name: "LLL",
            symbol: "LLL",
            decimals: 18,   
            address: "0x0cC0aB38d20614D6f68954F2Bdd59a049722e864",
            balance: "0",
            native: false
        },
        {
            name: "EURe",
            symbol: "EURe",
            decimals: 18,   
            address: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
            balance: "0",
            native: false
        }
    ],
    "base": [

        {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,   
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            balance: "0",
            native: true
        },
        {
            name: "xDAI",
            symbol: "xDAI",
            decimals: 18,   
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            balance: "0",
            native: false
        },  
        {
            name: "LLL",
            symbol: "LLL",
            decimals: 18,   
            address: "0x72cA0a8270467a50247D3cd9F7218b20A0516cc5",
            balance: "0",
            native: false
        },
    ]
}

