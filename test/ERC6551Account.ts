import { Contract, ContractFactory, Network, Signer, TransactionResponse } from "ethers";
import { ethers } from "hardhat"
import { id, parseEther, hashMessage, getBytes } from "ethers"
import { expect } from "chai";
import { get } from "http";

describe("ERC6551Account", () => {
    let accounts: Signer[];
    let Registry: Contract | any;
    let RegistryInstance: ContractFactory | any;
    let ERC721: Contract | any;
    let ERC6551Account: Contract | any;
    let ERC6551AccountAddress: BigInt;

    beforeEach(async () => {
        accounts = await ethers.getSigners();

        // Deploy the ERC6551 Registry Singleton contract
        const registryFactory: ContractFactory = await ethers.getContractFactory("ERC6551Registry");
        Registry = await registryFactory.connect(accounts[0]).deploy();
        RegistryInstance = registryFactory.attach(await Registry.getAddress());

        // Deploy and ERC721 contract to enable token bound accounts
        const ERC721Factory: ContractFactory = await ethers.getContractFactory("ERC721Mock");
        ERC721 = await ERC721Factory.connect(accounts[0]).deploy();
        await ERC721.mint(await accounts[1].getAddress(), BigInt(1));

        // Deploy an example ERC6551 Account contract
        const ERC6551AccountFactory: ContractFactory = await ethers.getContractFactory("ExampleERC6551Account");
        ERC6551Account = await ERC6551AccountFactory.connect(accounts[0]).deploy();

        const network: Network = await ethers.provider.getNetwork();
        const chainId: bigint = network.chainId;
        
        const tx: TransactionResponse = await Registry.createAccount(
            await ERC6551Account.getAddress(),
            chainId,
            await ERC721.getAddress(),
            BigInt(1),
            1,
            "0x"
        );

        await tx.wait();

        const events = await RegistryInstance.queryFilter(RegistryInstance.filters.AccountCreated(), tx.blockNumber);
        const event = await events[0];
        
        ERC6551AccountAddress = await event.args[0];
    })

    it("should return the valid signer", async () => {
        const validSigner = await accounts[1].getAddress();

        const ERC6551AccountInstance = (await ethers.getContractFactory("ExampleERC6551Account"))
            .attach(ERC6551AccountAddress.toString());
        
        const isValidSigner = await ERC6551AccountInstance.isValidSigner(
            validSigner,
            "0x"
        );

        const sigHash = id("isValidSigner(address,bytes)").substring(0, 10);
        expect(isValidSigner).to.be.equal(sigHash);
    })

    it("should return the right owner", async () => {
        const validOwner = await accounts[1].getAddress();

        const ERC6551AccountInstance = (await ethers.getContractFactory("ExampleERC6551Account"))
            .attach(ERC6551AccountAddress.toString());
        
        const owner = await ERC6551AccountInstance.owner();

        expect(owner).to.be.equal(validOwner);
    })

    it("should send ether through the execute function", async () => {
        const senderSigner = accounts[0];
        const accountOwnerSigner = accounts[1];
        const recipientSigner = accounts[2];
        
        const ERC6551AccountFactory = await ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance: any = ERC6551AccountFactory.attach(ERC6551AccountAddress.toString()).connect(accountOwnerSigner);
        
        // Sending 1 ether from sender to accountOwner
        const fundAccount1Tx = await senderSigner.sendTransaction({
            to: accountOwnerSigner.getAddress(),
            value: parseEther("1.0")
        });
        await fundAccount1Tx.wait();
        
        // Using ERC6551Account to send 0.5 ether to recipient
        const sendEtherToRecipientTx = await ERC6551AccountInstance.execute(
            await recipientSigner.getAddress(),
            parseEther("0.5"),
            "0x",
            0,
            { value: parseEther("0.5") }
        );
        await sendEtherToRecipientTx.wait();
        
        const finalRecipientBalance = await ethers.provider.getBalance(recipientSigner.getAddress());
        const expectedBalance = BigInt("10000500000000000000000")
        expect(finalRecipientBalance).to.be.equal(expectedBalance);
    })

    it("should verify owner signature", async () => {
        const accountOwnerSigner = accounts[1];

        const ERC6551AccountFactory = await ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance: any = ERC6551AccountFactory.attach(ERC6551AccountAddress.toString()).connect(accountOwnerSigner);

        const message = getBytes("0xDEADBEEF");
        const hash = hashMessage(message);

        const signature = await accountOwnerSigner.signMessage(message);

        const isValidSignature = await ERC6551AccountInstance.isValidSignature(getBytes(hash), signature);

        const sigHash = id("isValidSignature(bytes32,bytes)").substring(0, 10);
        
        expect(isValidSignature).to.be.equal(sigHash);
    })

    it("should return a valid token", async () => {
        const accountOwnerSigner = accounts[1];

        const ERC6551AccountFactory = await ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance: any = ERC6551AccountFactory.attach(ERC6551AccountAddress.toString()).connect(accountOwnerSigner);

        const [chainId, tokenAddress, tokenId] = await ERC6551AccountInstance.token();

        expect(chainId).to.be.equal((await ethers.provider.getNetwork()).chainId);
        expect(tokenAddress).to.be.equal(await ERC721.getAddress())
        expect(tokenId).to.be.equal(BigInt(1));
        
    })

})