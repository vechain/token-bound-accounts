"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const chainId = 246;
    const accounts = await hardhat_1.ethers.getSigners();
    // Deploy the ERC6551 Registry Singleton contract
    const registryFactory = await hardhat_1.ethers.getContractFactory("ERC6551Registry");
    const Registry = await registryFactory.deploy();
    const RegistryInstance = registryFactory.attach(await Registry.getAddress());
    console.log("Registry deployed to:", await Registry.getAddress());
    // Deploy and ERC721 contract to enable token bound accounts
    const ERC721Factory = await hardhat_1.ethers.getContractFactory("ERC721Mock");
    const ERC721 = await ERC721Factory.deploy();
    const ERC721Instance = ERC721Factory.attach(await ERC721.getAddress());
    console.log("ERC721 deployed to:", await ERC721Instance.getAddress());
    console.log("ERC721 name: ", await ERC721Instance.name());
    await ERC721Instance.mint(await accounts[1].getAddress(), 1);
    console.log("ERC721 owner of 1: ", await ERC721Instance.ownerOf(1));
    // Deploy an example ERC6551 Account contract
    const ERC6551AccountFactory = await hardhat_1.ethers.getContractFactory("ExampleERC6551Account");
    const ERC6551Account = await ERC6551AccountFactory.deploy();
    const tx = await Registry.createAccount(await ERC6551Account.getAddress(), chainId, await ERC721.getAddress(), BigInt(1), 1, "0x");
    const receipt = await tx.wait();
    const events = await RegistryInstance.queryFilter(RegistryInstance.filters.AccountCreated(), receipt?.blockNumber);
    const event = events[0];
    const ERC6551AccountAddress = await event.args[0];
    console.log("ERC6551Account deployed to:", ERC6551AccountAddress);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
});
