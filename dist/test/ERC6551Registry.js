"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
describe("ERC6551Registry", () => {
    let accounts;
    let Registry;
    let RegistryInstance;
    let ERC721;
    let ERC6551Account;
    let chainId;
    beforeEach(async () => {
        chainId = 246;
        accounts = await hardhat_1.ethers.getSigners();
        // Deploy the ERC6551 Registry Singleton contract
        const registryFactory = await hardhat_1.ethers.getContractFactory("ERC6551Registry");
        Registry = await registryFactory.deploy();
        RegistryInstance = registryFactory.attach(await Registry.getAddress());
        // Deploy and ERC721 contract to enable token bound accounts
        const ERC721Factory = await hardhat_1.ethers.getContractFactory("ERC721Mock");
        ERC721 = await ERC721Factory.connect(accounts[0]).deploy();
        await ERC721.mint(accounts[1].getAddress(), 1);
        // Deploy an example ERC6551 Account contract
        const ERC6551AccountFactory = await hardhat_1.ethers.getContractFactory("ExampleERC6551Account");
        ERC6551Account = await ERC6551AccountFactory.deploy();
    });
    // it("should create a token bound account", async () => {        
    //     const tx: TransactionResponse = await Registry.createAccount(
    //         await ERC6551Account.getAddress(),
    //         chainId,
    //         await ERC721.getAddress(),
    //         BigInt(1),
    //         1,
    //         "0x"
    //     );
    //     const receipt: TransactionReceipt | null  = await tx.wait();
    //     console.log(receipt);
    //     expect(receipt?.status).to.equal(1);
    // });
    it("should create a token bound account", async () => {
        const tx = await Registry.createAccount(await ERC6551Account.getAddress(), chainId, await ERC721.getAddress(), BigInt(2), 2, "0x");
        const receipt = await tx.wait();
        // // Query for the AccountCreated events emitted during the transaction
        const events = await RegistryInstance.queryFilter(RegistryInstance.filters.AccountCreated(), receipt?.blockNumber);
        console.log(events);
        // expect(events.length).to.not.equal(0);  // You can add this check to ensure that an event was indeed emitted
        // // // Parse the first event (assuming only one event of this type is emitted)
        // const event = events[0];
        // const accountAddress = event.args[0];
        // const computedAccountAddress = await Registry.account(
        //     await ERC6551Account.getAddress(),
        //     chainId,
        //     await ERC721.getAddress(),
        //     BigInt(2),
        //     2
        // );
        // expect(accountAddress).to.equal(computedAccountAddress);
    });
    it("should compute the address correctly", async () => {
        const tx = await Registry.createAccount(await ERC6551Account.getAddress(), chainId, await ERC721.getAddress(), BigInt(2), 2, "0x");
        const receipt = await tx.wait();
        // // Query for the AccountCreated events emitted during the transaction
        const events = await RegistryInstance.queryFilter(RegistryInstance.filters.AccountCreated(), receipt?.blockNumber);
        console.log(events);
        // expect(events.length).to.not.equal(0);  // You can add this check to ensure that an event was indeed emitted
        // // // Parse the first event (assuming only one event of this type is emitted)
        // const event = events[0];
        // const accountAddress = event.args[0];
        // const computedAccountAddress = await Registry.account(
        //     await ERC6551Account.getAddress(),
        //     chainId,
        //     await ERC721.getAddress(),
        //     BigInt(2),
        //     2
        // );
        // expect(accountAddress).to.equal(computedAccountAddress);
    });
});
