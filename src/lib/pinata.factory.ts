import { PinataSDK } from "pinata-web3";
import { CID } from 'multiformats/cid';
const jwt = import.meta.env.VITE_PINATA_JWT;

const pinata = new PinataSDK({
  pinataJwt: jwt!,
  pinataGateway: "tan-live-gazelle-558.mypinata.cloud",
});

export const uploadFile = async (metadata: any) => {
    
  try {
    const file = new File([JSON.stringify(metadata)], "metadata.json", { type: "text/plain" });
    const upload = await pinata.upload.file(file);
    const cidV1 = CID.parse(upload.IpfsHash);
    const cidV0 = cidV1.toV0();
    return cidV0.toString();

  } catch (error) {
    console.log(error);
    return "QmUrU11u74YrLbj9d1Z9JvPPZ2nXmgMVTgh2ZvjrTUc4ZQ";
  }
}


