

import { oft_abi } from "$lib/oft_abi";
import type { SafeService } from "$lib/safe.service";
import { Contract, ethers } from "ethers";

interface SendParam {
    dstEid: number; // uint32
    to: string; // bytes32 (hex string with 32-byte padding)
    amountLD: bigint; // uint256
    minAmountLD: bigint; // uint256
    extraOptions: string; // bytes (hex string)
    composeMsg: string; // bytes (hex string)
    oftCmd: string; // bytes (hex string)
  }
  

export const oftBridgeTx = async (srv: SafeService, token_address: string, formData: any) : Promise<any>=> {
    
    let destination_chain: number;
    switch (formData.chain) {
        case "gnosis":
            destination_chain = 30145;
            break;
        case "base":
            destination_chain = 30184;
            break;
        case "linea":
            destination_chain = 30183;
            break;
        default:
            console.error(`Unknown chain: ${formData.chain}`);
            return;
    }

    // const toAddressBytes32 = ethers.encodeBytes32String(toAddress);
    const toAddressBytes32 = ethers.zeroPadValue(formData.to, 32);

    // Specify amount (ensure it's in the correct decimals)
    const amountInWei = ethers.parseUnits(formData.amount.toString(), 18); // Assuming LLL token has 18 decimals

    // Adapter params (0 for no special params)
    const adapterParams = '0x';

    const sendParam: SendParam = {
        dstEid: destination_chain, // Example destination endpoint ID (Gnosis Chain for LayerZero)
        to: toAddressBytes32, // Recipient address padded to 32 bytes
        amountLD: amountInWei,
        minAmountLD: (amountInWei * BigInt(95) / BigInt(100)),
        extraOptions: "0x00030100110100000000000000000000000000030d40", // Empty extra options
        composeMsg: "0x", // Empty composed message
        oftCmd: "0x", // Empty OFT command
      };


    // console.log(sendParam);
    const fee = await srv.genericRead(token_address, oft_abi, "quoteSend", [sendParam, false]);
    // console.log(fee[0])

    return {
        sendParam: sendParam,
        fee: fee
    }


}

