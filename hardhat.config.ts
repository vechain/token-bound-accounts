import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import { VECHAIN_URL_SOLO } from "@vechain/hardhat-vechain";
import '@vechain/hardhat-ethers'

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    vechain: {
        url: VECHAIN_URL_SOLO
    },
}
};

export default config;
