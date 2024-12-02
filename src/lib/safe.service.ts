export const ssr = false;
export const prerender = false;

import { writable, type Writable } from 'svelte/store';
import Safe from "@safe-global/protocol-kit";
import { Safe4337Pack  } from "@safe-global/relay-kit";
import { type Signer, type Provider, type Contract, ethers } from "ethers";
import { getRPC, addressFromKey, getProvider, getInternalTransactions, isValidEthereumAddress, fixSafeAddress, displayAddress, displayShorterAddress } from "./eth.factory";
import { tokenList, type IToken } from './token.factory';
import { fromStore } from './store.factory';
import { type CirclesConfig, Sdk } from '@circles-sdk/sdk';
import { GnosisChainConfig } from './circles.factory';
import { hubv2_abi } from './circles_hub_v2';
import { CirclesData, CirclesRpc } from '@circles-sdk/data';
import { ipfs_cat } from './ipfs.factory';

// https://docs.safe.global/advanced/smart-account-supported-networks?service=Transaction+Service&version=v1.4.1&search=100&expand=100
const eip4337ModuleAddress = "0xa581c4A4DB7175302464fF3C06380BC3270b4037" // v3: "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226";
const migrationModuleAddress = "0x526643F69b81B008F46d95CD5ced5eC0edFFDaC6";
const hubv2Address = GnosisChainConfig.v2HubAddress != undefined ? GnosisChainConfig.v2HubAddress : "";


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
    hasAvatar: boolean;

    upgrade: () => Promise<void>;
    getBalances: () => Promise<void>;
    getSigners: () => Promise<void>;
    getVersion(safe_address: string) : Promise<void>;
    isDeployed(safe_address: string) : Promise<boolean>;
    addSigner(adress: string) : Promise<void>;
    genericRead: (address: string, abi: string, method: string, args: string[]) => Promise<any>;
    genericTx(address: string, abi: any, method: string, args: any[], includesDeploy: boolean) : Promise<string>;
    genericCall(contract_address: string, abi: any, method: string, args: any[]) : Promise<string>;

}

 
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
    circles_data?: any;
    hasAvatar: boolean = false;

    private constructor() {}

    static async create(signer_key: string, safe_address: string) {
        
        const instance = new SafeService();
        await instance.initialize(signer_key, safe_address);
        
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

        const circlesRpc = new CirclesRpc("https://rpc.aboutcircles.com");
        this.circles_data = new CirclesData(circlesRpc);

    }
   
    async setup () {

        await this.initSafeWithRelay();
        const d = await this.isDeployed();

        if (d) {
            await this.getVersion();
            await this.getSigners();
            await this.checkAvatar();
            if (this.hasAvatar) await this.getCircles();          
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
            this.safe_address = fixSafeAddress(await this.initSafeWithRelay());
            console.log("predictedAddress",this.safe_address);
        }
    }

    async new() {

        this.safe_address = fixSafeAddress(await this.initSafeWithRelay());
    }

    async checkAvatar() {
        
        try {
            const avatar = await this.genericCall(hubv2Address,hubv2_abi,"avatars",[this.safe_address]);
            console.log("avatar",avatar);
            this.hasAvatar = (avatar != "0x0000000000000000000000000000000000000000") ? true : false;
            return this.hasAvatar;

        } catch (error) {
            return false;
        }
    }

    async getCircles() {

        try {

            const balances = await this.circles_data?.getTokenBalances(this.safe_address);
            const issuance = await this.genericCall(hubv2Address,hubv2_abi,"calculateIssuance",[this.safe_address]);
            const mintable = ethers.formatUnits(issuance.split(",")[0], 18);

            function addressToUint256(address: string): string {
                const addressHex = address.startsWith("0x") ? address.slice(2) : address;
                const paddedHex = addressHex.padStart(64, '0');
                return BigInt("0x" + paddedHex).toString();
            }
            
            if(balances) {
                this.circles.update((circles) => {
                    for (let b of balances) {

                        let t: IToken = {
                            name: this.safe_address,
                            symbol: "crc",
                            decimals: 18,
                            address: b.tokenId,
                            balance: b.circles.toString(),
                            mintable: "0"
                        }

                        if (mintable != undefined && b.tokenId === addressToUint256(this.safe_address)) {
                            t.mintable = parseFloat(mintable.toString()).toFixed(0).toString();
                        }

                        circles.set(b.tokenId, t);
                    }
                    return circles
                });
            }

        } catch (error) {
            // console.log("no avatar")
        }
    }

    async mintCircles() {

        await this.genericTx(hubv2Address, hubv2_abi, "personalMint",[], false);

        return

    }

    async transferCircles(to: string, id: string, value: number) {

        const hubv2Address = GnosisChainConfig.v2HubAddress != undefined ? GnosisChainConfig.v2HubAddress : "";

        const from = this.safe_address;
        const data = "";

        await this.genericTx(hubv2Address, hubv2_abi, "safeTransferFrom",[from, to, id, value, data], false);

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

        this.kit = await Safe.init({
            provider: getRPC(CHAIN, alchemy_key),
            signer : this.signer_key,
            safeAddress : this.safe_address
        });
    }

    async initSafeWithRelay () {

        const rpc = getRPC(CHAIN, alchemy_key);
        const saltNonce = ethers.toBeHex(ethers.keccak256(ethers.toUtf8Bytes('plg_safe_v002_' + this.signer_address)));
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
            bundlerUrl: `https://api.pimlico.io/v2/100/rpc?apikey=${pimlico_key}`,
            options: options,
            paymasterOptions: { 
               paymasterAddress: "0x7B3f21F0284b4dc08E01Fa7e16b9b47249985F88",
               paymasterTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            //    isSponsored: true,
               // paymasterUrl: `https://api.pimlico.io/v2/100/rpc?apikey=${pimlico_key}`,
            }
        }); 

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
                const r = await this._4337tx(transactions, includesDeploy);
                resolve(r);

            } else {        
                const r = await this._tx(transactions, includesDeploy);
                resolve("ok");
            }  
        });
    }

    async genericCall(contract_address: string, abi: any, method: string, args: any[]) : Promise<string> {

        const contract = new ethers.Contract(contract_address, abi, this.provider);

        const response = await contract[method](...args);

        return response.toString();
    }

    async _tx(transactions: any, includesDeploy: boolean) {

        if (this.kit instanceof Safe) {

            const safeTransaction = await this.kit.createTransaction(transactions);

            try {
                const txHash = await this.kit.executeTransaction(safeTransaction);
                console.log('Transaction executed with hash:', txHash);
            } catch (error) {
                console.error('Transaction failed:', error);
            }
        }

    }

    async _4337tx(transactions: any, includesDeploy: boolean) { 

        if (this.kit instanceof Safe4337Pack) {

            const safeOperation = await this.kit.createTransaction({ transactions });
            const identifier = ethers.keccak256(ethers.toUtf8Bytes("plg_safe_tx"));

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
            console.log("txHash",userOperationPayload.transactionHash);

            this.provider.waitForTransaction(userOperationPayload.transactionHash);

            const txs = await getInternalTransactions(CHAIN, userOperationPayload.transactionHash, gnosisscan_key);
            console.log(txs)

            // check for succes or failure and pass up ??? 
    
            if (includesDeploy) {
                const tx = txs.find( (tx) => tx.contractAddress != "");
                console.log(tx);
                return tx.contractAddress;
            } else {
                return "finished";
            }
        }

    }

    async genericRead(address: string, abi: string, method: string, args: string[]) : Promise<any> {

        const contract = new ethers.Contract(address, abi, this.signer);
        return await contract[method](...args);
    }

    async isDeployed() : Promise<boolean> {

        const code = await this.provider.getCode(this.safe_address);
        const b = (code !== '0x') ? true : false;
        this.deployed.set(b);

        return b;
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
            this._tx([txData], false);
        } else  {
            this._4337tx([txData], false);
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
            this._tx([txData], false);
        } else  {
            this._4337tx([txData], false);
        }
    }
}
