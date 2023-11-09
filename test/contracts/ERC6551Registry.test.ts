import { ethers } from "hardhat"
import { deployERC6551Account, deployERC6551Registry, deployERC721 } from "../fixtures/setup";
import { ERC6551Registry, ERC721Mock, ExampleERC6551Account } from "../../typechain-types";
import { TransactionReceipt, TransactionResponse, EventLog, Log, randomBytes, BigNumberish } from "ethers";
import { getChainId, mintNFT } from "../helpers/utils";
import { expect } from "chai";

describe("ERC6551Registry", () => {
    let ERC6551RegistryInstance: ERC6551Registry;
    let ERC721MockInstance: ERC721Mock;
    let ExampleERC6551AccountInstance: ExampleERC6551Account;
    let createAccountTx: TransactionResponse | null;
    let salt: bigint;
    let tokenId: bigint;

    before(async () => {
        salt = 1n;
        tokenId = 1n;
        const accounts = await ethers.getSigners();

        ERC6551RegistryInstance = await deployERC6551Registry() as ERC6551Registry;
        ExampleERC6551AccountInstance = await deployERC6551Account() as ExampleERC6551Account;
        
        ERC721MockInstance = await deployERC721() as ERC721Mock;
        await mintNFT(ERC721MockInstance, await accounts[0].getAddress(), tokenId);

        
        createAccountTx = await ERC6551RegistryInstance.createAccount(
            await ExampleERC6551AccountInstance.getAddress(),
            await getChainId(),
            await ERC721MockInstance.getAddress(),
            tokenId,
            salt,
            "0x"
        );
    });

    it("should create a token bound account", async () => {
        const receipt: TransactionReceipt | null | undefined = await createAccountTx?.wait();
        expect(receipt?.status).to.equal(1);
    });

    it("should return the correct token bound account address", async () => {
        const receipt: TransactionReceipt | null | undefined = await createAccountTx?.wait();
        const events = await ERC6551RegistryInstance.queryFilter(ERC6551RegistryInstance.filters.AccountCreated(), receipt?.blockNumber);
        const event = events[0];
        const accountAddress = event.args[0];

        const computedAccountAddress = await ERC6551RegistryInstance.account(
            await ExampleERC6551AccountInstance.getAddress(),
            await getChainId(),
            await ERC721MockInstance.getAddress(),
            tokenId,
            salt
        );
    
        expect(accountAddress).to.equal(computedAccountAddress);
    });
});