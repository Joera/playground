export const ssr = false;
export const prerender = false;

import { writable, type Writable } from 'svelte/store';
import SafeApiKit from '@safe-global/api-kit'
import Safe from "@safe-global/protocol-kit";
import SafeFactory from "@safe-global/protocol-kit";
import { Safe4337Pack  } from "@safe-global/relay-kit";
import { type Signer, type Provider, type Contract, ethers } from "ethers";
import { getRPC, addressFromKey, getProvider, getInternalTransactions, isValidEthereumAddress } from "./eth.factory";
import { tokenList, type IToken } from './token.factory';
import { fromStore } from './store.factory';
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { type CirclesConfig, Sdk } from '@circles-sdk/sdk';
import {BrowserProviderContractRunner, PrivateKeyContractRunner} from "@circles-sdk/adapter-ethers"
import { GnosisChainConfig } from './circles.factory';

// https://docs.safe.global/advanced/smart-account-supported-networks?service=Transaction+Service&version=v1.4.1&search=100&expand=100
const eip4337ModuleAddress = "0xa581c4A4DB7175302464fF3C06380BC3270b4037" // v3: "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226";
const migrationModuleAddress = "0x526643F69b81B008F46d95CD5ced5eC0edFFDaC6";

export interface ISafeService {

    safe_address: string;
    signer_key: string;
    signer?: Signer;
    signer_address?: Writable<string>;
    signers: Writable<string[]>;
    kit?: Safe4337Pack | Safe;
    circles_sdk?: Sdk;
    provider: Provider;
    version: Writable<string>;
    deployed: Writable<boolean>;
    tokens: Writable<Map<string, IToken>>;
    circles: Writable<Map<string, any>>;
    modules: Writable<string[]>;
    hasAvatar: () => Promise<boolean>;

    upgrade: () => Promise<void>;
    getBalances: () => Promise<void>;
    getSigners: () => Promise<void>;
    getVersion(safe_address: string) : Promise<void>;
    isDeployed(safe_address: string) : Promise<boolean>;
    requestAccess() : Promise<void>;
    genericRead: (address: string, abi: string, method: string, args: string[]) => Promise<any>;
    genericTx(address: string, abi: any, method: string, args: any[], includesDeploy: boolean) : Promise<string>;
}

console.log(import.meta.env);
 
const CHAIN = "gno";
const alchemy_key = import.meta.env.VITE_ALCHEMY_KEY;
const pimlico_key = import.meta.env.VITE_PIMLICO_KEY;
const gnosisscan_key = import.meta.env.VITE_GNOSISSCAN_KEY;

export class SafeService implements ISafeService {

    avatar?: any;
    safe_address: string = "";
    signer_key: string = "";
    
    signer_address: Writable<string> = writable("");
    signers: Writable<string[]> = writable([]);
    version: Writable<string> = writable("");
    deployed: Writable<boolean> = writable(false);
    tokens: Writable<Map<string, IToken>> = writable(new Map());
    circles: Writable<Map<string, any>> = writable(new Map());
    modules: Writable<string[]> = writable([]);

    provider: Provider = getProvider(CHAIN, alchemy_key);

    signer?: Signer;
    kit?: Safe4337Pack | Safe;
    circles_sdk?: Sdk;

    private constructor() {}

    static async create(signer_key: string, safe_address: string) {
        
        const instance = new SafeService();
        await instance.initialize(signer_key, safe_address);
        await instance.initCirclesSDK();

        if (isValidEthereumAddress(safe_address)) {
            await instance.setup();
        } else {
            await instance.new();
        }

        return instance;
    }

    private async initialize(signer_key: string, safe_address: string) {

        this.signer_key = signer_key;
        this.safe_address = safe_address;
        let signer = new ethers.Wallet(signer_key);
        this.signer = signer.connect(this.provider);
        this.signer_address = writable(addressFromKey(signer_key));
    }
   
    async setup () {

        const d = await this.isDeployed();

        if (d) {
            await this.getVersion();
            await this.getSigners();
            
            await this.getCircles();
            await this.getModules();
            this.getBalances();

            const hasEIP4337Module = (await fromStore(this.modules)).includes(eip4337ModuleAddress);

            // version without paymaster
            if (await fromStore(this.version) == "1.3.0" || !hasEIP4337Module) {
                console.log("harry does not pay")
                await this.initSafe();
            }
            // version with paymaster
            if (await fromStore(this.version) == "1.4.1") {
                await this.initSafeWithRelay();
            }

        } else {
            await this.initSafeWithRelay();
        }
    }

    async new() {

        this.safe_address = await this.initSafeWithRelay();

    }

    async invite  (sdk: any, inviteeAddress: string)  {

        //const a = await this.circles_sdk.invite(inviteeAddress);    
    }

    async hasAvatar() {
        
        try {
            const avatar = await this.circles_sdk?.getAvatar(this.safe_address);
            return true;

        } catch (error) {

            return false;
        }
    }

    
    async initCirclesSDK() {
        
        const adapter = new PrivateKeyContractRunner(this.provider, this.signer_key);
        await adapter.init();
        this.circles_sdk = new Sdk(adapter, GnosisChainConfig);
    }

    async getCircles() {

        try {

            const avatar = await this.circles_sdk?.getAvatar(this.safe_address);
            const balances = await avatar?.getBalances();
            
            if(balances) {
                console.log(balances);
                this.circles.update((circles) => {
                    for (let b of balances) {
                        circles.set(b.tokenId, b.circles);
                    }
                    return circles
                });
            }

        } catch (error) {
            console.log("no avatar")
        }
    }

    async initSafe() {

        this.kit = await Safe.init({
            provider: getRPC(CHAIN, alchemy_key),
            signer : this.signer_key,
            safeAddress : this.safe_address
        });
    }

    async initSafeWithRelay () {

        const rpc = getRPC(CHAIN, alchemy_key);
        const saltNonce = ethers.toBeHex(ethers.keccak256(ethers.toUtf8Bytes('plg_safe_v001_' + this.signer_address)));
        let options: any = {};
        
        if (isValidEthereumAddress(this.safe_address) && await fromStore(this.deployed)) {
            console.log("init with existing safe");
            options = {
                safeAddress: this.safe_address
            } 
        } else {
            console.log("init with new safe");
            options = {
                owners: [await fromStore(this.signer_address)],
                threshold: 1,
                saltNonce
            }
        }
    
        this.kit = await Safe4337Pack.init({
            provider: rpc,
            signer: this.signer_key,
            bundlerUrl: `https://api.pimlico.io/v2/84532/rpc?apikey=${pimlico_key}`,
            options: options,
            paymasterOptions: { 
               isSponsored: true,
               paymasterUrl: `https://api.pimlico.io/v2/84532/rpc?apikey=${pimlico_key}`,
            }
        }); 

        // always predicted ????? 
        return this.kit.protocolKit.getAddress();
    }

    async genericTx (contract_address: string, abi: any, method: string, args: any[], includesDeploy: boolean) : Promise<string> {

        return new Promise( async (resolve, reject) => {
    
            const contract = new ethers.Contract(contract_address, abi, this.signer);
            const txData = contract.interface.encodeFunctionData(method, args);
    
            const transaction1 = { 
                to: contract_address,
                data: txData,
                value: "0"
            }
    
            const transactions = [transaction1];

            if (this.kit instanceof Safe4337Pack) {
    
                const safeOperation = await this.kit.createTransaction({ transactions });
                const identifier = ethers.keccak256(ethers.toUtf8Bytes("plg_safe_tx" + this.signer_address));
        
                safeOperation.data.callData = ethers.concat([
                    safeOperation?.data.callData as `0x{string}`,
                    identifier
                ]).toString()
                    
                const identifiedSafeOperation = await this.kit.getEstimateFee({
                    safeOperation
                });

                const signedSafeOperation = await this.kit.signSafeOperation(identifiedSafeOperation)
        
                const userOperationHash = await this.kit.executeTransaction({
                    executable: signedSafeOperation
                })
        
                let userOperationReceipt = null
        
                while (!userOperationReceipt) {
                    // Wait 2 seconds before checking the status again
                    await new Promise((resolve) => setTimeout(resolve, 2000))
                    userOperationReceipt = await this.kit.getUserOperationReceipt(
                        userOperationHash
                    )
                }
                
                const userOperationPayload = await this.kit.getUserOperationByHash(
                    userOperationHash
                );

                console.log("receipt",userOperationReceipt);
                console.log("payload",userOperationPayload);
        
                console.log("txHash",userOperationPayload);

                const txs = await getInternalTransactions(CHAIN, userOperationPayload.transactionHash, gnosisscan_key);
                console.log(txs)
        
                if (includesDeploy) {
                    const tx = txs.find( (tx) => tx.contractAddress != "");
                    console.log(tx);
                    resolve(tx.contractAddress);
                } else {
                    resolve("finished");
                }
            }   
        });
    }

    async genericRead(address: string, abi: string, method: string, args: string[]) : Promise<any> {

        const contract = new ethers.Contract(address, abi, this.signer);
        return await contract[method](...args);
    }

    async isDeployed() : Promise<boolean> {

        const code = await this.provider.getCode(this.safe_address);
        console.log(code)
        const b = (code !== '0x') ? true : false;
        this.deployed.set(b);

        return b;
    }

    async requestAccess() {

        const apiKit = new SafeApiKit({
            chainId: 100n
        });

        const newThreshold = 1;
        const method = "addOwnerWithThreshold";
        const args = [await fromStore(this.signer_address), newThreshold];
        const abi = ["function addOwnerWithThreshold(address, uint256)"];
        const contract = new ethers.Contract(this.safe_address, abi, this.signer);
        const txData = contract.interface.encodeFunctionData(method, args);

        const transactions: MetaTransactionData[] = [{
            to: this.safe_address,
            data: txData,
            value: "0",
            operation: 0
          }]
          
        if (this.kit instanceof Safe) {

            const txData = await this.kit.createTransaction({transactions});

            const safeTxHash = await this.kit.getTransactionHash(txData)
            const signature = await this.kit.signHash(safeTxHash)

            const response = await apiKit.proposeTransaction({
                safeAddress: this.safe_address,
                safeTransactionData: txData.data,
                safeTxHash,
                senderAddress: await fromStore(this.signer_address),
                senderSignature: signature.data
            });
        
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
        const v = await safeContract.VERSION();
        this.version.set(v);
    }

    async getBalances() : Promise<void> {

        for (let token of JSON.parse(JSON.stringify(tokenList))) {

            if (token.symbol === "xDAI") {
                token.balance = await this.getNativeBalance(this.safe_address); 
            } else {
                token.balance = await this.getBalance(token.address);
            }
            
            this.tokens.update((tokens) => {
                tokens.set(token.address, token);
                return tokens;
            });
        }
        console.log(this.safe_address, this.tokens);
       
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

        if(this.kit instanceof Safe) {

            const safeTransaction = await this.kit.createTransaction({ transactions :[txData] });

            try {
                const txHash = await this.kit.executeTransaction(safeTransaction);
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

            if (this.kit instanceof Safe) {

                const safeTransaction = await this.kit.createTransaction({ transactions :[txData1, txData2] });
    
                try {
                    const txHash = await this.kit.executeTransaction(safeTransaction);
                    console.log('Transaction executed with hash:', txHash);
                } catch (error) {
                    console.error('Transaction failed:', error);
                }
            }
        }
    }

    // async addMigrationModule() {
    //     const safeSdk = await Safe.create({ ethAdapter: new Safe.EthersAdapter({ ethers, this.signer }), safeAddress });
      
    //     const migrationModuleAddress = "0x526643F69b81B008F46d95CD5ced5eC0edFFDaC6";
    //     // Propose module addition transaction
    //     const txData = safeSdk.createEnableModuleTx(migrationModuleAddress);
    //     const txResponse = await safeSdk.proposeTransaction({ safeTransactionData: txData });
    //     console.log("Module addition transaction sent:", txResponse.hash);
      
    //     // Wait for the transaction to confirm
    //     await txResponse.wait();
    //     console.log("SafeMigration module added successfully.");
    //   }

 
    

   


    

}