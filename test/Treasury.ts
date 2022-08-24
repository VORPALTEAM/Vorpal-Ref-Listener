import { ethers } from "hardhat";
import { expect } from "chai";
import { prepareSignatureTest } from "../utils/prepareSignature";
import { Message } from "../utils/types";


describe("Treasury", function() {
    
    async function treasuryFixture() {
        const nonce = 10;
        const tokens = ethers.BigNumber.from(ethers.utils.parseEther('5'));

        const [minter, receiver] = await ethers.getSigners();
        const { address: minterAddress } = minter;
        const { address: receiverAddress } = receiver;  

        const Treasury = await ethers.getContractFactory("Treasury");
        const treasury = await Treasury.deploy("VorpalTreasury");
        const { address: treasuryAddress } = treasury;

        const Vorpal = await ethers.getContractFactory("Vorpal");
        const vorpal = await Vorpal.deploy();
        await vorpal.mint(treasuryAddress, tokens);
        await treasury.setVorpal(vorpal.address);

        const message: Message = {
            nonce,            
            minter: minterAddress,
            receiver: receiverAddress,
            amount: tokens
        }

        const signature = await prepareSignatureTest(message, minter, treasuryAddress);

        return { minter, receiver, treasury, vorpal, message, signature, tokens}
    }

    describe("Treasury", async () => {
        it("Should transfer tokens by signature", async () => {
            const { receiver, treasury, vorpal, message, signature, tokens } = await treasuryFixture();
            await treasury.connect(receiver).transferUsingSignature(message, signature)
            
            const receiverBalance = await vorpal.balanceOf(receiver.address); 
            expect(receiverBalance.toString()).to.equal(tokens.toString());
        })
    })

});