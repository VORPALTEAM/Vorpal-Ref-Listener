import "@nomicfoundation/hardhat-toolbox"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.15",
  typechain: {
    outDir: 'src/typechain',
    target: 'ethers-v5',
  },
};
