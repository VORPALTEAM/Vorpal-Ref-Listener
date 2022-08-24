//SPDX-License-Identifier: Unlicense

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Vorpal is ERC20 {
    constructor() ERC20("Vorpal", "VRP") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
