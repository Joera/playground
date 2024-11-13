import type { Provider } from "ethers";
import { ethers } from "ethers";
import { getProvider } from "./eth.factory";

export interface IToken {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
    balance: string;
}

export interface ITokenService {

    provider: Provider
}

export const tokenList: IToken[] = [
    {
        name: "GNO",
        symbol: "GNO",
        decimals: 18,   
        address: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
        balance: "0"
    }, 
    {
        name: "xDAI",
        symbol: "xDAI",
        decimals: 18,   
        address: "0x6b175474e89094c44da98b954eedeac495271d0f",
        balance: "0"
    },  
    // {
    //     name: "EURe",
    //     symbol: "EURe",
    //     decimals: 18,   
    //     address: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
    //     balance: "0"
    // } 

];
