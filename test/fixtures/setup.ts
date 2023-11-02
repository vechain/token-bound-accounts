import { ethers } from "hardhat";

export async function deployERC721() {
    const ERC721MockFactory = await ethers.getContractFactory("ERC721Mock");
    const ERC721Mock = await ERC721MockFactory.deploy();
    return ERC721MockFactory.attach(await ERC721Mock.getAddress());
}

export async function deployERC6551Registry() {
    const ERC6551RegistryFactory = await ethers.getContractFactory("ERC6551Registry");
    const ERC6551Registry = await ERC6551RegistryFactory.deploy();
    return ERC6551RegistryFactory.attach(await ERC6551Registry.getAddress());
}

export async function deployERC6551Account() {
    const ExampleERC6551AccountFactory = await ethers.getContractFactory("ExampleERC6551Account");
    const ExampleERC6551Account = await ExampleERC6551AccountFactory.deploy();
    return ExampleERC6551AccountFactory.attach(await ExampleERC6551Account.getAddress());
}