
const TransferFundsType = [
    { name: 'nonce', type: 'uint256' },
    { name: 'receiver', type: 'address' },
    { name: 'minter', type: 'address' },
    { name: 'amount', type: 'uint256' },
];

const EIP712DomainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];

export function buildMessageTest(
    rawMessage,
    chainId
) {
    const { nonce, receiver, minter, amount, verifyingContract } = rawMessage;
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
        primaryType: 'TransferFundsType',
        types: {
            TransferFunds: TransferFundsType,
        }
    }
}

export function buildMessageMetamask(
    rawMessage,
    chainId
) {
    const { nonce, receiver, minter, amount, verifyingContract } = rawMessage;
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
        primaryType: 'TransferFundsType',
        types: {
            EIP712Domain: EIP712DomainType,
            TransferFunds: TransferFundsType,
        }
    }
}