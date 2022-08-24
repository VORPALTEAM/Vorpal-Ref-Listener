// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.15;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";


/// @title Treasury contract
/// @notice Stores and receives Vorpal tokens for future distribution

contract Treasury is AccessControl, EIP712 {
    using SafeERC20 for IERC20;

    struct TransferFundsParams {
        uint256 nonce;
        address minter;
        address receiver;
        uint256 amount;
    }

    IERC20 public vorpal;

    bytes32 private constant TRANSFER_FUNDS_TYPEHASH = keccak256("TransferFunds(uint256 nonce,address minter,address receiver,uint256 amount)");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    mapping(uint256 => bool) private nonces;    

    // Address is equal to zero
    error ZeroAddress();

    constructor(string memory name) EIP712(name, "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /// @notice Sets up Vorpal token
    function setVorpal(address _vorpal) external onlyRole(OPERATOR_ROLE) {
        if(_vorpal == address(0)){
            revert ZeroAddress();
        }
        vorpal = IERC20(_vorpal);
    }  

    /// @notice Transfers tokens to an address
    function transfer(address to, uint256 value) external onlyRole(OPERATOR_ROLE) returns (bool) {
        vorpal.safeTransfer(to, value);
        return true;
    }

    /// @notice Transfers tokens to an address 
    function transferUsingSignature(TransferFundsParams calldata params, bytes memory sig) external {
        require(!nonces[params.nonce], "Treasury: Nonce has been used");
        bytes32 structHash = keccak256(
            abi.encode(
                TRANSFER_FUNDS_TYPEHASH,
                params.nonce,
                params.minter,
                params.receiver,
                params.amount
            )
        );
        bytes32 hash = _hashTypedDataV4(structHash);
        address recoveredOwner = ECDSA.recover(hash, sig);
        require(recoveredOwner == params.minter, "Treasury: Invalid recovered address");
        require(msg.sender == params.receiver, "Treasury: Invalid receiver");
        vorpal.safeTransfer(params.receiver, params.amount);
    }

    /// @notice Returns Vorpal balance
    function getBalance() external view returns (uint256) {
        return vorpal.balanceOf(address(this));
    }

    /// @notice Grants `Operator` role to an account
    function grantOperatorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(OPERATOR_ROLE, account);
    } 
}