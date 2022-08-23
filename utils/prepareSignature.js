import { EIP712DomainType, TransferFundsType } from "./types.js";
const sigUtil = require("@metamask/eth-sig-util");

export async function makeSignatureTest(rawMessage, signer) {
    const chainId = await signer.getChainId();
    const { domain, types, message } = buildDeleteGroupMessage(
        rawMessage,
        chainId,
    );
    return signer._signTypedData(domain, types, message);

}

export async function prepareSignatureMetamask(rawMessage, signer) {
    const chainId = await signer.getChainId();
    const params = buildDeleteGroupMessage(
        rawMessage,
        chainId,
    );
    const callParams = {
        privateKey: Buffer.from(signer.privateKey),
        data: params,
        version: sigUtil.SignTypedDataVersion.V4
    }

    return sigUtil.signTypedData(callParams);
} 