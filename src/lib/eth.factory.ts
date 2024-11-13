import { ethers, type Provider } from "ethers";

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

        case 'gno':
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

        case 'gno':
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
    return chain + ":" + address.substring(0, 6) + "..." + address.substring(38, 42);
}

export const displaySafeAddress = (chain: string,address: string) => {
    return `<a href="https://app.safe.global/apps?safe=${chain}:${address}" target="_blank">${displayAddress(chain, address)}</a>`
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
