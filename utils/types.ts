import { MessageTypes, TypedMessage } from "@metamask/eth-sig-util";
import { BigNumberish } from "ethers";
import {
    TypedDataField,
    TypedDataDomain,
} from '@ethersproject/abstract-signer';

const TransferFundsType = [
    { name: 'nonce', type: 'uint256' },
    { name: 'minter', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'amount', type: 'uint256' },
];

const EIP712DomainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];

export interface Message {
    nonce: BigNumberish;
    minter: string;
    receiver: string;
    amount: BigNumberish;
}

export interface SignerLike {
    address: string;
    getChainId(): Promise<number>;
    _signTypedData(
        domain: TypedDataDomain,
        types: Record<string, Array<TypedDataField>>,
        value: Record<string, any>,
    ): Promise<string>;
}


export function buildMessageTest(
    rawMessage: Message,
    chainId: number,
    verifyingContract: string,
) {
    const { nonce, minter, receiver, amount } = rawMessage;
    return {
        domain: {
            chainId,
            name: "VorpalTreasury",
            verifyingContract,
            version: '1'
        },
        message: {
            nonce,
            receiver,
            minter,
            amount,
        },
        primaryType: 'TransferFunds',
        types: {
            TransferFunds: TransferFundsType,
        }
    }
}

export function buildMessageMetamask(
    rawMessage: Message,
    chainId: number,
    verifyingContract: string,
): TypedMessage<MessageTypes> {
    const params = buildMessageTest(rawMessage, chainId, verifyingContract);
    return {
        ...params,
        types: { ...params.types, EIP712Domain: EIP712DomainType },
    };
}