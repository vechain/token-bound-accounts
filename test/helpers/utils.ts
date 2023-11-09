import { ethers } from "hardhat"
import { ERC721Mock } from "../../typechain-types/";
import { BigNumberish, HDNodeWallet } from "ethers";

export async function getChainId(): Promise<bigint> {
    return (await ethers.provider.getNetwork()).chainId
}

export async function mintNFT(ERC721Instance: ERC721Mock, address: string, tokenId: BigInt) {
    const tx = await ERC721Instance.mint(address, tokenId as BigNumberish);
    return await tx.wait();
}

export async function getWallet() {
    const network = (await ethers.provider.getNetwork())
    
    if (network.name == 'vechain') {
        const wallet = ethers.Wallet.fromPhrase("")
    }
}

export async function createCustomWallet(): Promise<HDNodeWallet> {
    return ethers.Wallet.fromPhrase("denial kitchen pet squirrel other broom bar gas better priority spoil cross")
}