import { ethers } from "hardhat"
import { expect } from "chai";
import { AddressLike, BigNumberish, getBytes, hashMessage, id, parseEther } from "ethers";
import { ERC721Mock, ERC6551Registry, ExampleERC6551Account } from "../../typechain-types";
import { deployERC6551Account, deployERC6551Registry, deployERC721 } from "../fixtures/setup";
import { TransactionReceipt, TransactionResponse } from "ethers";
import { createCustomWallet, getChainId, mintNFT } from "../helpers/utils";

describe("ExampleERC6551Account", () => {
    let ERC6551RegistryInstance: ERC6551Registry;
    let ERC721MockInstance: ERC721Mock;
    let ExampleERC6551AccountInstance: ExampleERC6551Account;
    let ExampleERC6551TestAccountInstance: ExampleERC6551Account;
    let createAccountTx: TransactionResponse | null;
    let salt: bigint;
    let tokenId: bigint;
    let accounts: any;
    
    before(async () => {
        salt = 1n;
        tokenId = 1n;
        accounts = await ethers.getSigners();

        ERC6551RegistryInstance = await deployERC6551Registry() as ERC6551Registry;
        ExampleERC6551AccountInstance = await deployERC6551Account() as ExampleERC6551Account;
        ERC721MockInstance = await deployERC721() as ERC721Mock;

        const validSigner = await accounts[1].getAddress();
        await mintNFT(ERC721MockInstance, await validSigner, tokenId);
    
        createAccountTx = await ERC6551RegistryInstance.createAccount(
            await ExampleERC6551AccountInstance.getAddress(),
            await getChainId(true),
            await ERC721MockInstance.getAddress(),
            tokenId,
            salt,
            "0x"
        );
        
        tokenId += 1n;
        salt += 1n;

        const receipt: TransactionReceipt | null = await createAccountTx.wait();

        expect(receipt?.status).to.equal(1);

        const events = await ERC6551RegistryInstance.queryFilter(ERC6551RegistryInstance.filters.AccountCreated(), receipt?.blockNumber);
        const event = events[0];
        
        const ERC6551AccountAddress = event.args[0];

        ExampleERC6551TestAccountInstance = (await ethers.getContractFactory("ExampleERC6551Account")).attach(ERC6551AccountAddress) as ExampleERC6551Account;     
    });

    it("should return the valid signer", async () => {
        const validSigner = await accounts[1].getAddress();
        
        const isValidSigner = await ExampleERC6551TestAccountInstance.isValidSigner(
            validSigner,
            "0x"
        );

        const sigHash = id("isValidSigner(address,bytes)").substring(0, 10);
        expect(isValidSigner).to.be.equal(sigHash);
    });

    it("should return the right owner", async () => {
        const validOwner = await accounts[1].getAddress();
        
        const owner = await ExampleERC6551TestAccountInstance.owner();

        expect(owner).to.be.equal(validOwner);
    });

    it("should send ether through the execute function", async () => {
        const senderSigner = accounts[0];
        const accountOwnerSigner = accounts[1];
        const recipientSigner = accounts[2];
        
        const initialRecipientBalance: bigint = await ethers.provider.getBalance(recipientSigner.getAddress());
        
        // Sending 1 ether from sender to accountOwner
        const fundAccount1Tx = await senderSigner.sendTransaction({
            to: ExampleERC6551TestAccountInstance.getAddress(),
            value: parseEther("1.0")
        });
        await fundAccount1Tx.wait();
        
        // Using ERC6551Account to send 0.5 ether to recipient
        const sendEtherToRecipientTx = await ExampleERC6551TestAccountInstance.connect(accountOwnerSigner).execute(
            await recipientSigner.getAddress(),
            parseEther("0.5"),
            "0x",
            0,
            { value: parseEther("0.5") }
        );
        await sendEtherToRecipientTx.wait();
        
        const finalRecipientBalance: bigint = await ethers.provider.getBalance(recipientSigner.getAddress());
        const balanceDifference: bigint = finalRecipientBalance - initialRecipientBalance;
        
        expect(parseEther("0.5")).to.be.equal(balanceDifference);
    });

    it("should verify owner signature", async () => {
        const customWallet = await createCustomWallet();
        const accountOwner = customWallet.deriveChild(0);

        await mintNFT(ERC721MockInstance, await accountOwner.getAddress(), tokenId);

        const tx: TransactionResponse = await ERC6551RegistryInstance.createAccount(
            await ExampleERC6551AccountInstance.getAddress(),
            await getChainId(true),
            await ERC721MockInstance.getAddress(),
            tokenId,
            salt,
            "0x"
        );
        tokenId += 1n;
        salt += 1n;

        const receipt: TransactionReceipt | null = await tx.wait();

        const events = await ERC6551RegistryInstance.queryFilter(ERC6551RegistryInstance.filters.AccountCreated(), receipt?.blockNumber);
        const event = events[0];
        
        const accountOwnerContractAddress = event.args[0];

        const ERC6551AccountFactory = await ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance: any = ERC6551AccountFactory.attach(accountOwnerContractAddress.toString());

        const message = getBytes("0xDEADBEEF");
        const hash = hashMessage(message);

        const signature = await accountOwner.signMessage(message);

        const isValidSignature = await ERC6551AccountInstance.isValidSignature(getBytes(hash), signature);

        const sigHash = id("isValidSignature(bytes32,bytes)").substring(0, 10);
        
        expect(isValidSignature).to.be.equal(sigHash);
    });

    it("should return a valid token", async () => {
        const [_chainId, _tokenAddress, _tokenId] = await ExampleERC6551TestAccountInstance.token();

        expect(_chainId).to.be.equal(_chainId);
        expect(_tokenAddress).to.be.equal(await ERC721MockInstance.getAddress())
        expect(_tokenId).to.be.equal(1n);
    })
});