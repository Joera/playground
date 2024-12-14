import { ethers, type Provider } from "ethers";
import { writable, type Writable } from "svelte/store";

const pimlico_key = import.meta.env.VITE_PIMLICO_KEY;


export const getPaymasterOptions = (chain: string) => {

    switch (chain) {

        // pimlico on gnosis requires extra token bundle @ 100 p.m. 

        case 'gnosis':
            return {
                // 0x29b75b68551F2D2B3f298d327A20ac2289f0bb36
                paymasterAddress: "0x29b75b68551F2D2B3f298d327A20ac2289f0bb36",
                paymasterTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                // isSponsored: true,
                // paymasterUrl: `https://api.pimlico.io/v2/100/rpc?apikey=${pimlico_key}`,
                // paymasterAddress: '0x00000000000000fb866daaa79352cc568a005d96',
                // paymasterTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                // sponsorshipPolicyId : "sp_lethal_king_cobra"
            }   

        case 'base':
            return {
              //  paymasterAddress: "0x7B3f21F0284b4dc08E01Fa7e16b9b47249985F88",
                // 0x29b75b68551F2D2B3f298d327A20ac2289f0bb36
                paymasterAddress: "0x29b75b68551F2D2B3f298d327A20ac2289f0bb36",
                paymasterTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                // isSponsored: true,
                // paymasterUrl: `https://api.pimlico.io/v2/8453/rpc?apikey=${pimlico_key}`,
                // paymasterAddress: '0x00000000000000fb866daaa79352cc568a005d96',
                // paymasterTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
                // sponsorshipPolicyId : "sp_lethal_king_cobra"
            }
    }
 }

export const getBundlerUrl = (chain: string) => {

    switch (chain) {

        case 'base':

            return `https://api.pimlico.io/v2/8453/rpc?apikey=pim_mDc8aW5VLSFczkXhVHp2gW`;

        case 'gnosis':

            return `https://api.pimlico.io/v2/100/rpc?apikey=pim_B9EiWd9e25ykuWi1xFpA8n`;

        default:

            return `https://api.pimlico.io/v2/100/rpc?apikey=pim_B9EiWd9e25ykuWi1xFpA8n`;


    }

}

export const getRPC = (chain: string, alchemy_key: string) => {

    let rpc;

    switch (chain) {

        case 'eth':
            rpc = `https://eth-mainnet.g.alchemy.com/v2/${alchemy_key}`;
            break;

        case 'arbsep': 
            rpc = `https://arb-sepolia.g.alchemy.com/v2/${alchemy_key}`;
            break;

        case 'basesep':
            rpc = `https://base-sepolia.g.alchemy.com/v2/${alchemy_key}`;
            break;

        case 'base':
                rpc = `https://base-mainnet.g.alchemy.com/v2/${alchemy_key}`;
                break;

        case 'gnosis':
            rpc = `https://rpc.gnosis.gateway.fm`;
            break;

        default:
            rpc = `https://arb-sepolia.g.alchemy.com/v2/${alchemy_key}`;
    
    }

    return rpc;
}

export const getProvider = (chain: string, alchemy_key: string) => {

    let provider;

    switch (chain) {

        case 'gnosis':
            provider = ethers.getDefaultProvider("https://rpc.gnosischain.com");
            break;

        case 'eth':
            provider = ethers.getDefaultProvider(
                "https://eth-mainnet.g.alchemy.com/v2/" + alchemy_key ,
                {
                    alchemy: alchemy_key 
                }
            );
            break;

        case 'arbsep': 
            provider = ethers.getDefaultProvider(
                "https://arb-sepolia.g.alchemy.com/v2/" + alchemy_key ,
                {
                    alchemy: alchemy_key 
                }
            );
            break;

        case 'base':
            provider = ethers.getDefaultProvider(
                `https://base-mainnet.g.alchemy.com/v2/${alchemy_key}`,
                {
                    alchemy: alchemy_key   
                }
            );
            break;

        case 'basesep':
            provider = ethers.getDefaultProvider(
                "https://base-sepolia.g.alchemy.com/v2/" + alchemy_key ,       
                {
                    alchemy: alchemy_key
                }
            )
            break;

        default:
            provider = ethers.getDefaultProvider(
                "https://arb-sepolia.g.alchemy.com/v2/" + alchemy_key ,
                {
                    alchemy: alchemy_key 
                }
            )
    }

    return provider;
}

export const addressFromKey = (privateKey: string) => {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
}

export const blockTime = async (block_number: string, provider: Provider) : Promise<string> =>  {

    const block = await provider.getBlock(block_number);
    if (block != null) {
        const blockTime = new Date(block.timestamp * 1000); 
        return blockTime.toLocaleDateString('nl') + " " + blockTime.toLocaleTimeString('nl'); //   toLocaleDateTimeString('nl')
    } else {
        return '-'
    }
}

export const getInternalTransactions = async (chain: string,txHash: string, token: string) : Promise<any[]> => {

    return new Promise( (resolve, reject) : any => {

        let url = `https://api.gnosisscan.io/api?module=account&action=txlistinternal&txhash=${txHash}&apikey=${token}`

        fetch(url)
            .then(response => response.json())  
            .then(response => {
                resolve(response.result)
            })
            .catch(err => console.error(err));

    });
}

export const displayAddress = (chain: string,address: string) => {

    let a = "0x";
    try {
        a = chain + ":" + address.substring(0, 4) + "..." + address.substring(38, 42);
    }
    catch (error) {
        console.log(error)
    }

    return a;
}

export const displayShortAddress = (address: string) => {

    let a = "0x";
    try {
        a = address.substring(0, 4) + "..." + address.substring(38, 42);
    }
    catch (error) {
        console.log(error)
    }

    return a;
}

export const displayShorterAddress = (address: string) => {

    let a = "0x";
    try {
        a = "..." + address.substring(38, 42);
    }
    catch (error) {
        console.log(error)
    }

    return a;
}


export const displaySafeLink = (chain: string, address: string) => {
    return `<a href="https://app.safe.global/apps?safe=${chain}:${address}" target="_blank">${displayShortAddress(address)}</a>`
}

export const isValidEthereumAddress = (address: string) => {
    // Check if the address is 42 characters long and starts with '0x'
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return false;
    }
    // Optional: Implement checksum validation (more complex)
    return true; // Return true if all checks pass
}

export const roundBalance = (balance: string) => {

    return parseFloat(balance).toFixed(3);
}

export const fixSafeAddress = (address: string) => {
    
    return ethers.getAddress(address);
}

export function fixAddressArray<T extends Iterable<any>>(store: Writable<T> | undefined): Writable<T> {
    if (store != undefined) {
        store.update((arr) => {
            console.log(arr)

            for (let a of arr) {
                if (typeof a == "string") {
                    a = fixSafeAddress(a)
                }
            }
            console.log(arr)
            return arr; 
        });
        return store; 
    } else {
        return writable<T>({} as T);
    }
}

export const hexToAddress = (hexString: string) => {
    
    if (hexString.length !== 66 || !hexString.startsWith("0x")) {
        throw new Error("Invalid hex string format");
    }
    const address = `0x${hexString.slice(-40)}`;
    if (!ethers.isAddress(address)) {
        throw new Error("Invalid Ethereum address");
    }

    return address;

}  

export const addressToUint256 = (address: string)  => {

    return  ethers.toBigInt(
        ethers.getAddress(
            address
        ))
        .toString();
}

export const expiryTimeHex = () => {

    const expiryTimeMs = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000; 
    const expiryTimeSeconds = Math.floor(expiryTimeMs / 1000);
    return "0x" + expiryTimeSeconds.toString(16).padStart(64, '0');
}

export const expiredTimeHex = () => {
    const expiryTimeSeconds = 0;
    return "0x" + expiryTimeSeconds.toString(16).padStart(64, '0');
}
