

import { Contract, ethers } from "ethers";

export const oftBridgeTx = async (oftContract: Contract,fromAddress: string, toAddress: string, destination_chain_id: number, amount: number) => {
    
    const toAddressBytes32 = ethers.encodeBytes32String(toAddress);

    // Specify amount (ensure it's in the correct decimals)
    const amountInWei = ethers.parseUnits(amount.toString(), 18); // Assuming LLL token has 18 decimals

    // Adapter params (0 for no special params)
    const adapterParams = '0x';

    // Estimate gas fee for cross-chain message
    const fee = await oftContract.getFee(destination_chain_id, false, adapterParams);

    console.log(`Estimated fee: ${ethers.formatEther(fee)} ETH`);

    return [
        fromAddress,          // Sender's address
        destination_chain_id,    // Destination chain ID (Gnosis Chain)
        toAddressBytes32,        // Recipient's address in bytes32
        amountInWei,             // Amount to send
        fromAddress,          // Refund address for excess gas
        ethers.ZeroAddress,      // No ZRO token payment
        adapterParams,           // Adapter params
        { value: fee }           // Fee for LayerZero message
    ]

    // Send tokens
    // return await oftContract.sendFrom(
    //     fromAddress,          // Sender's address
    //     destination_chain_id,    // Destination chain ID (Gnosis Chain)
    //     toAddressBytes32,        // Recipient's address in bytes32
    //     amountInWei,             // Amount to send
    //     fromAddress,          // Refund address for excess gas
    //     ethers.ZeroAddress,      // No ZRO token payment
    //     adapterParams,           // Adapter params
    //     { value: fee }           // Fee for LayerZero message
    // );
}

