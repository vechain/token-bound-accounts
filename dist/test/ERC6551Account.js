"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const ethers_1 = require("ethers");
const chai_1 = require("chai");
describe("ERC6551Account", () => {
    let accounts;
    let Registry;
    let RegistryInstance;
    let ERC721;
    let ERC6551Account;
    let ERC6551AccountAddress;
    let chainId;
    beforeEach(async () => {
        chainId = BigInt(20257036855429895315704288894496386224204271168750785572924599986678n);
        accounts = await hardhat_1.ethers.getSigners();
        // Deploy the ERC6551 Registry Singleton contract
        const registryFactory = await hardhat_1.ethers.getContractFactory("ERC6551Registry");
        Registry = await registryFactory.deploy();
        RegistryInstance = registryFactory.attach(await Registry.getAddress());
        // Deploy and ERC721 contract to enable token bound accounts
        const ERC721Factory = await hardhat_1.ethers.getContractFactory("ERC721Mock");
        ERC721 = await ERC721Factory.deploy();
        await ERC721.mint(await accounts[1].getAddress(), 1);
        // Deploy an example ERC6551 Account contract
        const ERC6551AccountFactory = await hardhat_1.ethers.getContractFactory("ExampleERC6551Account");
        ERC6551Account = await ERC6551AccountFactory.deploy();
        const tx = await Registry.createAccount(await ERC6551Account.getAddress(), chainId, await ERC721.getAddress(), BigInt(1), 1, "0x");
        const receipt = await tx.wait();
        const events = await RegistryInstance.queryFilter(RegistryInstance.filters.AccountCreated(), receipt?.blockNumber);
        const event = events[0];
        ERC6551AccountAddress = await event.args[0];
    });
    it("should return the valid signer", async () => {
        const validSigner = await accounts[1].getAddress();
        const ERC6551AccountInstance = (await hardhat_1.ethers.getContractFactory("ExampleERC6551Account"))
            .attach(ERC6551AccountAddress.toString());
        const isValidSigner = await ERC6551AccountInstance.isValidSigner(validSigner, "0x");
        const sigHash = (0, ethers_1.id)("isValidSigner(address,bytes)").substring(0, 10);
        (0, chai_1.expect)(isValidSigner).to.be.equal(sigHash);
    });
    it("should return the right owner", async () => {
        const validOwner = await accounts[1].getAddress();
        const ERC6551AccountInstance = (await hardhat_1.ethers.getContractFactory("ExampleERC6551Account"))
            .attach(ERC6551AccountAddress.toString());
        const owner = await ERC6551AccountInstance.owner();
        (0, chai_1.expect)(owner).to.be.equal(validOwner);
    });
    it("should send ether through the execute function", async () => {
        const senderSigner = accounts[0];
        const accountOwnerSigner = accounts[1];
        const recipientSigner = accounts[2];
        const initialRecipientBalance = await hardhat_1.ethers.provider.getBalance(accountOwnerSigner.getAddress());
        const ERC6551AccountFactory = await hardhat_1.ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance = ERC6551AccountFactory.attach(ERC6551AccountAddress.toString()).connect(accountOwnerSigner);
        // Sending 1 ether from sender to accountOwner
        const fundAccount1Tx = await senderSigner.sendTransaction({
            to: accountOwnerSigner.getAddress(),
            value: (0, ethers_1.parseEther)("1.0")
        });
        await fundAccount1Tx.wait();
        // Using ERC6551Account to send 0.5 ether to recipient
        const sendEtherToRecipientTx = await ERC6551AccountInstance.execute(await recipientSigner.getAddress(), (0, ethers_1.parseEther)("0.5"), "0x", 0, { value: (0, ethers_1.parseEther)("0.5") });
        await sendEtherToRecipientTx.wait();
        const finalRecipientBalance = await hardhat_1.ethers.provider.getBalance(recipientSigner.getAddress());
        const balanceDifference = finalRecipientBalance - initialRecipientBalance;
        (0, chai_1.expect)((0, ethers_1.parseEther)("0.5")).to.be.equal(balanceDifference);
    });
    it("should verify owner signature", async () => {
        const accountOwnerSigner = accounts[1];
        const ERC6551AccountFactory = await hardhat_1.ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance = ERC6551AccountFactory.attach(ERC6551AccountAddress.toString());
        const message = (0, ethers_1.getBytes)("0xDEADBEEF");
        const hash = (0, ethers_1.hashMessage)(message);
        const signature = await accountOwnerSigner.signMessage(message);
        const isValidSignature = await ERC6551AccountInstance.isValidSignature((0, ethers_1.getBytes)(hash), signature);
        const sigHash = (0, ethers_1.id)("isValidSignature(bytes32,bytes)").substring(0, 10);
        (0, chai_1.expect)(isValidSignature).to.be.equal(sigHash);
    });
    it("should return a valid token", async () => {
        const ERC6551AccountFactory = await hardhat_1.ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance = ERC6551AccountFactory.attach(ERC6551AccountAddress.toString());
        const [_chainId, _tokenAddress, _tokenId] = await ERC6551AccountInstance.token();
        (0, chai_1.expect)(_chainId).to.be.equal(_chainId);
        (0, chai_1.expect)(_tokenAddress).to.be.equal(await ERC721.getAddress());
        (0, chai_1.expect)(_tokenId).to.be.equal(BigInt(1));
    });
});
