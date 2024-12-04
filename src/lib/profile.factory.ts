import { uint8ArrayToCidV0, hexStringToUint8Array } from "@circles-sdk/utils";
import { ipfs_cat } from "./ipfs.factory";
import type { ISafeService } from "./safe.service";

export const getProfile = async(srv: ISafeService) => {

    console.log(0);

    const abi = [
        {
        type: "function",
        name: "getMetadataDigest",
        inputs: [
            {
                name: "_avatar",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bytes32",
                internalType: "bytes32",
            },
        ],
        stateMutability: "view",
    }
    ];

    const nameRegistryAddress = "0xA27566fD89162cC3D40Cb59c87AAaA49B85F3474"
    let hex = await srv.genericCall(nameRegistryAddress, abi, "getMetadataDigest", [srv.safe_address]);

    let p = {
        name: "",
        description: ""
    }

    console.log(1);

    if (hex != "0x0000000000000000000000000000000000000000000000000000000000000000") {

        hex = hex.startsWith("0x") ? hex.slice(2) : hex;
        let profile_cid  = uint8ArrayToCidV0(hexStringToUint8Array(hex));

        let _profile = null;

        try {
            _profile = await ipfs_cat(profile_cid);
        } catch (error) {
            console.log(error)
        }

        if (_profile != null && _profile != undefined) {
            p = _profile
        }  
    }

    return p;
}