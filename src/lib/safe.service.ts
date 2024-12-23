export const ssr = false;
export const prerender = false;

import { get, writable, type Writable } from 'svelte/store';
import Safe from "@safe-global/protocol-kit";
import { Safe4337Pack  } from "@safe-global/relay-kit";
import { type Signer, type Provider, type Contract, ethers } from "ethers";
import { getRPC, addressFromKey, getProvider, getInternalTransactions, isValidEthereumAddress, fixSafeAddress, displayAddress, displayShorterAddress, getBundlerUrl, getPaymasterOptions } from "./factory/eth.factory";
import { tokenList, type IToken } from './factory/token.factory';
import { fromStore } from './factory/store.factory';
import { hubv2_abi } from './circles_hub_v2';
import { CirclesData, CirclesRpc } from '@circles-sdk/data';
import { ipfs_cat } from './factory/ipfs.factory';
import { HUBV2ADDRESS } from './constants';
import { addSafeAddress, formatSafeAddress } from './store/safe.store';
import { tx, tx4337 } from './factory/aa.factory';
import { updateCircleBalances } from './factory/circles.factory';
import { updateContacts } from './factory/contact.factory';

// https://docs.safe.global/advanced/smart-account-supported-networks?service=Transaction+Service&version=v1.4.1&search=100&expand=100
const eip4337ModuleAddress = "0xa581c4A4DB7175302464fF3C06380BC3270b4037" // v3: "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226";
const migrationModuleAddress = "0x526643F69b81B008F46d95CD5ced5eC0edFFDaC6";
const welcomeNFTAddress = "0xe151Bf8B3D209cc84F0bdf7d13FD7Ebfe9beb6f4";

export interface ISafeService {

    chain: string;
    safe_address: string;
    signer_key: string;
    signer?: Signer;
    signer_address?: Writable<string>;
    signers: Writable<string[]>;
    kit?: Safe4337Pack | Safe;
    provider: Provider;
    version: Writable<string>;
    deployed: Writable<boolean>;
    tokens: Writable<Map<string, IToken>>;
    circles: Writable<Map<string, any>>;
    modules: Writable<string[]>;
    // hasAvatar: boolean;

    upgrade: () => Promise<void>;
    getBalances: () => Promise<void>;
    getSigners: () => Promise<void>;
    getVersion(safe_address: string) : Promise<void>;
    isDeployed(safe_address: string) : Promise<boolean>;
    addSigner(adress: string) : Promise<void>;
    genericRead: (address: string, abi: string, method: string, args: string[]) => Promise<any>;
    genericTx(address: string, abi: any, method: string, args: any[], includesDeploy: boolean) : Promise<string>;
    genericCall(contract_address: string, abi: any, method: string, args: any[]) : Promise<string>;
    getContacts: () => Promise<any>;
}

const alchemy_key = import.meta.env.VITE_ALCHEMY_KEY;
const pimlico_key = import.meta.env.VITE_PIMLICO_KEY;


export class SafeService implements ISafeService {

    // avatar?: any;
    chain!: string;
    safe_address: string = "";
    signer_key: string = "";
    
    signer_address: Writable<string> = writable("");
    signers: Writable<string[]> = writable([]);
    version: Writable<string> = writable("");
    deployed: Writable<boolean> = writable(false);
    tokens: Writable<Map<string, IToken>> = writable(new Map());
    circles: Writable<Map<string, any>> = writable(new Map());
    modules: Writable<string[]> = writable([]);
    contacts: Writable<any[]> = writable([]);

    provider!: Provider;

    signer?: Signer;
    kit?: Safe4337Pack;
    legacy_kit?: Safe;
    circles_data?: any;
  //  hasAvatar: boolean = false;

    private constructor() {}

    getDeployed() {
        return get(this.deployed); // Access the current value of the store
      }
    
      setDeployed(b: boolean) {
        this.deployed.set(b); // Update the store's value
      }

    static async create(chain: string, signer_key: string, safe_address: string) {

        chain = chain == "gno" ? "gnosis" : chain;
        console.log('start creating srv for ', chain, safe_address);
        const instance = new SafeService();
        await instance.initialize(chain, signer_key, safe_address);
        if (instance.provider == undefined) return instance;
        await instance.setup();
            
        console.log('finished creating srv for ', instance.chain, instance.safe_address);

        return instance;
    }

    private async initialize(chain: string, signer_key: string, safe_address: string) {

        this.chain = chain
        this.signer_key = signer_key;
        this.safe_address = safe_address;

        try {
            this.provider = getProvider(chain, alchemy_key);
        } catch (error) {
            console.log("provider error", this.chain,error);
        }

        if (this.provider == undefined) return;

        let signer = new ethers.Wallet(signer_key, this.provider);
        this.signer = signer.connect(this.provider);
        this.signer_address = writable(addressFromKey(signer_key));
        
        if (chain == "gnosis") {
            const circlesRpc = new CirclesRpc("https://rpc.aboutcircles.com");
            this.circles_data = new CirclesData(circlesRpc);
        }
    }
   
    async setup () {

        this.setDeployed(
            await this.isDeployed()
        );

        await this.initSafe();
        this.safe_address = fixSafeAddress(await this.initSafeWithRelay());
        addSafeAddress(formatSafeAddress(this.chain, this.safe_address));
        
        if (this.getDeployed()) {
            
            await this.getVersion();

            await this.getSigners();
            // if (this.chain == "gnosis") {
            //     await this.checkAvatar();
            //     if (this.hasAvatar) {
            //         await updateCircleBalances(this);
            //     }
            // }     
               
            await this.getModules();
      
          //  this.getBalances();
          

            // const hasEIP4337Module = (await fromStore(this.modules)).includes(eip4337ModuleAddress);
            // version without paymaster
            // if (await fromStore(this.version) == "1.3.0" || !hasEIP4337Module) {
            //     console.log("harry does not pay")
            //     await this.initSafe();
            // }
            // // version with paymaster
            // if (await fromStore(this.version) == "1.4.1") {
            //     await this.initSafeWithRelay();
            // }

        } 
    }

    async getCircles() {

        return await updateCircleBalances(this);
    }


    // async checkAvatar() {
        
    //     try {
    //         const avatar = await this.genericCall(HUBV2ADDRESS,hubv2_abi,"avatars",[this.safe_address]);
    //         console.log("avatar", avatar, this.safe_address);
    //         this.hasAvatar = (avatar != "0x0000000000000000000000000000000000000000") ? true : false;
    //         return this.hasAvatar;

    //     } catch (error) {
    //         console.log("avatar", error);
    //         return false;
    //     }
    //}

    

    async mintCircles() {

        return await this.genericTx(HUBV2ADDRESS, hubv2_abi, "personalMint",[], false);

    }

    async transferCircles(to: string, id: string, value: number) {

        const from = this.safe_address;
        const data = "";

        await this.genericTx(HUBV2ADDRESS, hubv2_abi, "safeTransferFrom",[from, to, id, value, data], false);

        return

    }

    async getAvatarName(address: string) {
        
        let cid;

        try {
            cid = await this.circles_data.getMetadataCidForAddress(address);
        } catch (error) {
            return undefined;
        }

        if (cid != undefined) {

            let profile: any;
            try {
                profile = await ipfs_cat(cid);
            } catch (error) {
                return displayShorterAddress(address);
            }
            if(profile && profile.name) {
                return profile.name;
            } else {
                return displayShorterAddress(address);
            }    
        }  else {
            undefined
        }  
    }

    async getCircleTxs() {
        return await this.circles_data.getTransactionHistory(this.safe_address,100);
    }

    async getCircleEvents() {
        return await this.circles_data.getEvents(this.safe_address,10000000);
    }

    async getSponsor() {
        return await this.circles_data.getAvatarInfo(this.safe_address);
    }

    async getNetwork() {
        return await this.circles_data.getTrustRelations(this.safe_address);
    }

    async initSafe() {

        this.legacy_kit = await Safe.init({
            provider: getRPC(this.chain, alchemy_key),
            signer : this.signer_key,
            safeAddress : this.safe_address
        });
    }

    async initSafeWithRelay () {

        const rpc = getRPC(this.chain, alchemy_key);
        const saltNonce = ethers.toBeHex(ethers.keccak256(ethers.toUtf8Bytes('plg_safe_v002_' + this.signer_address)));
        let options: any = {};
        
        if (isValidEthereumAddress(this.safe_address) && this.getDeployed()) {
            console.log("init with existing safe", this.chain);
            options = {
                safeAddress: this.safe_address
            } 
        } else {
            console.log("init with new safe", this.chain);
            options = {
                owners: [await fromStore(this.signer_address)],
                threshold: 1,
                saltNonce
            }
        }
        
        this.kit = await Safe4337Pack.init({    
            provider: rpc,
            signer: this.signer_key,
            bundlerUrl: getBundlerUrl(this.chain) || "",
            options: options,
            paymasterOptions: getPaymasterOptions(this.chain)
        }); 

        return this.kit.protocolKit.getAddress();
    }

    async nativeTx (to_address: string, value: string) : Promise<string> {

        return new Promise( async (resolve, reject) => {
    
            const transaction1 = { 
                to: to_address,
                data: "0x",
                value
            }
    
            const transactions = [transaction1];

            if (this.kit instanceof Safe4337Pack) {
                const r = await tx4337(this,transactions, false);
                resolve(r);

            } else {       
                const r = await tx(this,transactions, false);
                resolve("ok");
            }  
        });
    }

    async genericTx (contract_address: string, abi: any, method: string, args: any[], includesDeploy: boolean, extraGas?: number, legacy: boolean = false) : Promise<string> {

        return new Promise( async (resolve, reject) => {
    
            const contract = new ethers.Contract(contract_address, abi, this.signer);
            const txData = contract.interface.encodeFunctionData(method, args);
    
            const transaction1 = { 
                to: contract_address,
                data: txData,
                value: "0"
            }
    
            const transactions = [transaction1];

            if (this.kit instanceof Safe4337Pack && !legacy) {
                const r = await tx4337(this,transactions, includesDeploy, extraGas);
                resolve(r);

            } else {       
                console.log("legacy txs", transactions);
                const r = await tx(this,transactions, includesDeploy);
                resolve("ok");
            }  
        });
    }

    async genericCall(contract_address: string, abi: any, method: string, args: any[]) : Promise<string> {

        const contract = new ethers.Contract(contract_address, abi, this.provider);
        const response = await contract[method](...args);
        return response.toString();
    }

    async genericRead(address: string, abi: any, method: string, args: any[]) : Promise<any> {

        const contract = new ethers.Contract(address, abi, this.signer);
        return await contract[method](...args);
    }

    async isDeployed() : Promise<boolean> {

        if (this.safe_address != "0x") {
            const code = await this.provider.getCode(this.safe_address);
            return (code !== '0x') ? true : false;
        } else {
            return false
        }
    }


    async getModules() {

        const safeAbi = [
            "function getModules() view returns (address[])"
        ];

        const safeContract = new ethers.Contract(this.safe_address, safeAbi, this.provider);
        const v = await safeContract.getModules();
        this.modules.update( (mods) => {
            mods.push(...v);
            return mods;
        });
        
    }

    async getVersion() {

        const gnosisSafeAbi = [
            "function VERSION() view returns (string)"
        ];

        const safeContract = new ethers.Contract(this.safe_address, gnosisSafeAbi, this.provider);

        let v;

        try {
            v = await safeContract.VERSION();
        } catch (e) {
            v = "unknown";
        }
        
        this.version.set(v);
    }

    async getBalances() : Promise<void> {

        for (let token of JSON.parse(JSON.stringify(tokenList[this.chain]))) {

            try {

                if (token.symbol === "xDAI") {
                    token.balance = await this.getNativeBalance(this.safe_address); 
                } else {
                    token.balance = await this.getBalance(token.address);
                }
                
                this.tokens.update((tokens) => {
                    tokens.set(token.address, token);
                    return tokens;
                });

            } catch (e) {
                console.log(e);
            }
        }
        // console.log(this.safe_address, this.tokens);
       
    }

    async getNativeBalance(address: string) : Promise<string> { 

        const balance = await this.provider.getBalance(address);
        return ethers.formatUnits(balance, 18);
    }


    async getBalance(token_address: string) : Promise<string> {

        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint256)"
        ];
        const tokenContract = new ethers.Contract(token_address, erc20Abi, this.provider);
        const balance = await tokenContract.balanceOf(this.safe_address);
        return ethers.formatUnits(balance, 18);
    }

    async getSigners() : Promise<void> {
       
        const gnosisSafeAbi = [
            "function getOwners() external view returns (address[] memory)"
        ];

        const safeContract = new ethers.Contract(this.safe_address, gnosisSafeAbi, this.provider);
        const s = await safeContract.getOwners();
        this.signers.set(s)
    }


    async upgrade() {

        const migrationData = new ethers.Interface([
            "function migrateL2WithFallbackHandler()"
        ]).encodeFunctionData("migrateL2WithFallbackHandler");

        // Define the transaction data with delegate call
        const txData = {
            to: migrationModuleAddress,    
            value: "0",            
            data: migrationData,        
            operation: 1, 
        };

        // if(this.kit instanceof Safe) {

        const safeTransaction = await this.legacy_kit?.createTransaction({ transactions :[txData] });

        if (safeTransaction) {

            try {
                const txHash = await this.legacy_kit?.executeTransaction(safeTransaction);
                console.log('Transaction executed with hash:', txHash);
            } catch (error) {
                console.error('Transaction failed:', error);
            }
        }
    }

    async addAcountAbstractionModule() {

        if(this.kit instanceof Safe) {

            const safeAbi = [
                "function setFallbackHandler(address module) external"
            ];
            
            const safeContract = new ethers.Contract(this.safe_address, safeAbi, this.signer);
            const data = safeContract.interface.encodeFunctionData("setFallbackHandler", [eip4337ModuleAddress]);

            const txData1 = { 
                to: this.safe_address,
                data,
                value: '0'  
            };

            const safeAbi2 = [
                "function enableModule(address module) external"
            ];
            const safeContract2 = new ethers.Contract(this.safe_address, safeAbi2, this.signer);

            const data2 = safeContract2.interface.encodeFunctionData("enableModule", [eip4337ModuleAddress]);

            const txData2 = { 
                to: this.safe_address,
                data: data2,
                value: '0'  
            };

            const safeTransaction = await this.legacy_kit?.createTransaction({ transactions :[txData1, txData2] });

            if (safeTransaction) {
    
                try {
                    const txHash = await this.legacy_kit?.executeTransaction(safeTransaction);
                    console.log('Transaction executed with hash:', txHash);
                } catch (error) {
                    console.error('Transaction failed:', error);
                }
            }
        }
    }

    async enableModule(moduleAddress: string) {

        // console.log("safe",this.safe_address);

        const safeAbi = ["function enableModule(address module) external"];
        const safeContract = new ethers.Contract(this.safe_address, safeAbi, this.signer);
        const data = safeContract.interface.encodeFunctionData("enableModule", [moduleAddress]);

        const txData = { 
            to: this.safe_address,
            data: data,
            value: '0'  
        };

        if (this.kit instanceof Safe) {
            tx(this,[txData], false);
        } else  {
            tx4337(this,[txData], false);
        }
    }

    async addSigner(address: string) {

        const abi = ["function addOwnerWithThreshold(address, uint256)"];
        const safeContract = new ethers.Contract(this.safe_address, abi, this.signer);
        const data = safeContract.interface.encodeFunctionData("addOwnerWithThreshold", [address,1]);

        const txData = { 
            to: this.safe_address,
            data: data,
            value: '0'  
        };

        if (this.kit instanceof Safe) {
            await tx(this,[txData], false);
        } else  {
            await tx4337(this,[txData], false);
        }

        return
    }

    async checkNFT() {

        console.log("checking NFT", this.safe_address);

        const abi = [
            {
                "constant": true,
                "inputs": [{"name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function"
              }
        ];

        // console.log(this.provider)
        const balance = await this.genericCall(ethers.getAddress(welcomeNFTAddress),abi,"balanceOf",[ethers.getAddress(this.safe_address)]);
      
        return (Number(balance) > 0) ? true : false;

    }

    async mintNFT() {

        console.log("minting NFT");

        const abi = new ethers.Interface([
            "function mint(address to) public"
        ]);

        console.log("safe address", this.safe_address)
        await this.genericTx(welcomeNFTAddress,abi,"mint",[this.safe_address], false);
        return
    }

    async getContacts() {

        this.contacts.set(
            await updateContacts(this)
        )
    }
}