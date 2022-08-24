const { default: axios } = require("axios");
const { ethers } = require("ethers");
const abi = require("./abi/swap_abi.json");
require("dotenv").config();

async function main() {
    const swapAddress = process.env.SWAP_ADDRESS;
    const vorpalAddress = process.env.VORPAL_ADDRESS;
    const infuraKey = process.env.INFURA_KEY;
    const apiLink = process.env.API_URL;

    const swapPercentage = process.env.SWAP_PERCENTAGE;

    const wssLink = `wss://goerli.infura.io/ws/v3/${infuraKey}`;
    const provider = new ethers.providers.WebSocketProvider(wssLink);

    const contract = new ethers.Contract(swapAddress, abi, provider);

    console.log('listening')

    const usersURI = `${apiLink}/users`;
    const refURI = `${apiLink}/referral-links`;

    contract.on("Rewarded", async (account, input, output, amount, quantity, event) => {
        if (input == vorpalAddress || output == vorpalAddress) {
            console.log('Vorpal Detected');
            console.log(account, input, output, amount, quantity)
            try {
                let receiver = await(await axios.get(`${usersURI}/find-by-address/${account}`)).data.user;
                console.log(receiver);
                const refLink = await(await axios.get(`${refURI}/${receiver.referrer}`)).data.refLinks;
                console.log(refLink);
                let creator = await(await axios.get(`${usersURI}/find-by-address/${refLink.creatorAddress}`)).data.user;
                console.log(creator)
                let receiverBalance = ethers.BigNumber.from(receiver.balance);
                receiverBalance = receiverBalance.add(quantity.div(100).mul(swapPercentage).div(100).mul(refLink.referralPercent));
                receiver.balance = receiverBalance.toString();

                let creatorBalance = ethers.BigNumber.from(creator.balance);
                creatorBalance = creatorBalance.add(quantity.div(100).mul(swapPercentage).div(100).mul(refLink.creatorPercent));
                creator.balance = creatorBalance.toString();

                await axios.patch(`${usersURI}/${receiver._id}`, receiver);
                await axios.patch(`${usersURI}/${creator._id}`, creator);

                receiver = await(await axios.get(`${usersURI}/find-by-address/${account}`)).data.user;
                creator = await(await axios.get(`${usersURI}/find-by-address/${refLink.creatorAddress}`)).data.user;

            } catch (error) {
                console.log(error);
            }
        }
    });
}

main();