import { ethers } from "hardhat"
import { Contract, Signer, ContractFactory, Network, TransactionReceipt, TransactionResponse } from "ethers"
import { expect } from "chai";

describe("ERC6551Registry", () => {
    let accounts: Signer[];
    let Registry: Contract | any;
    let RegistryInstance: ContractFactory | any;
    let ERC721: Contract | any;
    let ERC6551Account: Contract | any;

    beforeEach(async () => {
        accounts = await ethers.getSigners();

        // Deploy the ERC6551 Registry Singleton contract
        const registryFactory: ContractFactory = await ethers.getContractFactory("ERC6551Registry");
        Registry = await registryFactory.deploy();
        RegistryInstance = registryFactory.attach(await Registry.getAddress());

        // Deploy and ERC721 contract to enable token bound accounts
        const ERC721Factory: ContractFactory = await ethers.getContractFactory("ERC721Mock");
        ERC721 = await ERC721Factory.connect(accounts[0]).deploy();
        await ERC721.mint(accounts[1].getAddress(), 1);

        // Deploy an example ERC6551 Account contract
        const ERC6551AccountFactory: ContractFactory = await ethers.getContractFactory("ExampleERC6551Account");
        ERC6551Account = await ERC6551AccountFactory.deploy();
    })

    it("should create a token bound account", async () => {
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

        const receipt: TransactionReceipt | null  = await tx.wait();

        expect(receipt?.status).to.equal(1);
    });


    it("should compute the address correctly", async () => {
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
    
        // Query for the AccountCreated events emitted during the transaction
        const events = await RegistryInstance.queryFilter(RegistryInstance.filters.AccountCreated(), tx.blockHash);
        
        expect(events.length).to.not.equal(0);  // You can add this check to ensure that an event was indeed emitted
        
        // Parse the first event (assuming only one event of this type is emitted)
        const event = events[0];
        
        const accountAddress = event.args[0];
    
        const computedAccountAddress = await Registry.account(
            await ERC6551Account.getAddress(),
            chainId,
            await ERC721.getAddress(),
            BigInt(1),
            1
        );
    
        expect(accountAddress).to.equal(computedAccountAddress);
    })
    
})