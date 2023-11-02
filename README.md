# Token Bound Accounts

## Introduction

Token Bound Accounts is a Hardhat-based project utilizing TypeScript, focused on the implementation of the [EIP-6551](https://eips.ethereum.org/EIPS/eip-6551) standard for Non-fungible Token Bound Account. In this project we used the reference implementation of ERC6551Registry and ExampleERC6551Account as given in the EIP6551 proposal. We have added several tests to prove its functionality in the VeChain ecosystem. 

## Background

The ERC-721 standard has led to a myriad of applications for non-fungible tokens (NFTs). From collectibles and generative art to unique representations of real-world assets, the potential uses of NFTs have been ever-expanding. However, the inability of NFTs to act as independent agents or associate directly with other on-chain assets presents a significant limitation.

Token Bound Accounts project bridges this gap by offering a system where every NFT can possess the same rights as an Ethereum user, effectively creating smart contract accounts that are deterministically bound to NFTs. These accounts are controlled by the NFT holders and have the capability to:

- Hold and manage assets
- Interact with contracts
- Control multiple accounts
- Operate across multiple chains

The implementation leverages a singleton registry to ensure that each NFT is permanently linked to a unique smart contract account, thus enabling complex asset representation and management.

## Use Cases

With Token Bound Accounts, you can represent a variety of real-world and digital assets with more complex needs, such as:

- Characters in a virtual world with evolving traits and assets
- Vehicles with distinct parts and history
- Diversified investment portfolios
- Membership passes with usage tracking

## Compatibility

The design pattern established in this proposal does not necessitate any modifications to existing NFT contracts and is inherently compatible with almost all current Ethereum infrastructure. This includes, but is not limited to:

- On-chain protocols
- Off-chain indexing services
- Various asset standards (existing and future)

## Getting Started

To begin using or contributing to the Token Bound Accounts project, please follow the steps below:

1. **Clone the Repository**

    ```
    git clone https://github.com/vechainfoundation/token-bound-accounts.git
    ```

2. **Install Dependencies**

    Navigate to the cloned directory and run:

    ```
    npm install
    ```

3. **Compile Contracts**

    ```
    npx hardhat compile
    ```

4. **Run Tests**

    Ensure that Thor solo is running and then run:

    ```
    npx hardhat test --network vechain
    ```

5. **Deployment**

    To deploy the contracts on a network, use:

    ```
    npx hardhat run scripts/deploy.js --network yourNetwork
    ```

