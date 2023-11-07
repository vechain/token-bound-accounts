import { ERC721Mock, ERC6551Registry, ExampleERC6551Account } from "../../typechain-types";
import { deployERC6551Account, deployERC6551Registry, deployERC721 } from "../fixtures/setup";
import { mintNFT } from "../helpers/utils";

describe("Deploy ERC4337 Prerequisites", () => {
    let ERC6551RegistryInstance: ERC6551Registry;
    let ERC721MockInstance: ERC721Mock;
    let ExampleERC6551AccountInstance: ExampleERC6551Account;
    let salt: bigint;
    let tokenId: bigint;

    it("Should Deploy", async () => {
        salt = 1n;
        tokenId = 1n;

        ERC6551RegistryInstance = await deployERC6551Registry() as ERC6551Registry;
        ExampleERC6551AccountInstance = await deployERC6551Account() as ExampleERC6551Account;
        ERC721MockInstance = await deployERC721() as ERC721Mock;

        const simpleAccountAddress = "0xF511D49a5615777798765A8d29642D2DfFc2D372"

        await mintNFT(ERC721MockInstance, simpleAccountAddress, tokenId);

        console.log("ERC6551Registry: ", await ERC6551RegistryInstance.getAddress());
        console.log("ERC6551Account:  ", await ExampleERC6551AccountInstance.getAddress());
        console.log("ERC721Mock:      ", await ERC721MockInstance.getAddress());
    })

});