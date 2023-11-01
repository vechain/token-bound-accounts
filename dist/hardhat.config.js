"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
const hardhat_vechain_1 = require("@vechain/hardhat-vechain");
require("@vechain/hardhat-ethers");
const config = {
    solidity: "0.8.20",
    networks: {
        vechain: {
            url: hardhat_vechain_1.VECHAIN_URL_SOLO
        },
    }
};
exports.default = config;
