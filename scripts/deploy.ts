import { ethers } from "hardhat";

async function main() {
    // Retrieve accounts from the local node
    const accounts = await ethers.getSigners();
    console.log('Deploying contracts with the account:', accounts[0].address);

    console.log("Deploying ERC6551 Registry...")
    const ERC6551RegistryFactory = await ethers.getContractFactory("ERC6551Registry");
    const ERC6551Registry = await ERC6551RegistryFactory.deploy();

    console.log("Deploying ERC6551 Account...")
    const ExampleERC6551AccountFactory = await ethers.getContractFactory("ExampleERC6551Account");
    const ExampleERC6551Account = await ExampleERC6551AccountFactory.deploy();

    console.log("ERC6551Registry address:          ", await ERC6551Registry.getAddress());
    console.log("ExampleERC6551Account address:    ", await ExampleERC6551Account.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});
