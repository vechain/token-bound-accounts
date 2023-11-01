import { Contract, ContractFactory, Mnemonic, Network, Signature, Signer, TransactionReceipt, TransactionResponse } from "ethers";
import { ethers } from "hardhat"
import { id, parseEther, hashMessage, getBytes, Wallet, HDNodeWallet } from "ethers"
import { expect } from "chai";
import { ExampleERC6551Account, ERC6551Registry } from "../typechain-types";

describe("ERC6551Account", () => {
    let accounts: Signer[];
    let Registry: Contract | any;
    let RegistryInstance: ERC6551Registry | any;
    let ERC721: Contract | any;
    let ERC6551Account: Contract | any;
    let ERC6551AccountAddress: BigInt;
    let chainId: BigInt;
    const VET_DERIVATION_PATH = `m/44'/818'/0'/0/0`;

    beforeEach(async () => {
        chainId = BigInt(20257036855429895315704288894496386224204271168750785572924599986678n);
        accounts = await ethers.getSigners();
        
        // Deploy the ERC6551 Registry Singleton contract
        const registryFactory: ContractFactory = await ethers.getContractFactory("ERC6551Registry");
        Registry = await registryFactory.deploy();
        RegistryInstance = registryFactory.attach(await Registry.getAddress());

        // Deploy and ERC721 contract to enable token bound accounts
        const ERC721Factory: ContractFactory = await ethers.getContractFactory("ERC721Mock");
        ERC721 = await ERC721Factory.deploy();
        await ERC721.mint(await accounts[1].getAddress(), 1);

        // Deploy an example ERC6551 Account contract
        const ERC6551AccountFactory: ContractFactory = await ethers.getContractFactory("ExampleERC6551Account");
        ERC6551Account = await ERC6551AccountFactory.deploy();
        
        const tx: TransactionResponse = await Registry.createAccount(
            await ERC6551Account.getAddress(),
            chainId,
            await ERC721.getAddress(),
            BigInt(1),
            1,
            "0x"
        );

        const receipt: TransactionReceipt | null = await tx.wait();

        const events = await RegistryInstance.queryFilter(RegistryInstance.filters.AccountCreated(), receipt?.blockNumber);
        const event = events[0];
        
        ERC6551AccountAddress = await event.args[0];
    })

    it("should return the valid signer", async () => {
        const validSigner = await accounts[1].getAddress();

        const ERC6551AccountInstance = (await ethers.getContractFactory("ExampleERC6551Account"))
            .attach(ERC6551AccountAddress.toString()) as ExampleERC6551Account;
        
        const isValidSigner = await ERC6551AccountInstance.isValidSigner(
            validSigner,
            "0x"
        );

        const sigHash = id("isValidSigner(address,bytes)").substring(0, 10);
        expect(isValidSigner).to.be.equal(sigHash);
    })

    it("should return the right owner", async () => {
        const validOwner = await accounts[1].getAddress();

        const ERC6551AccountInstance = (await ethers.getContractFactory("ExampleERC6551Account"))
            .attach(ERC6551AccountAddress.toString()) as ExampleERC6551Account;
        
        const owner = await ERC6551AccountInstance.owner();

        expect(owner).to.be.equal(validOwner);
    })

    it("should send ether through the execute function", async () => {
        const senderSigner = accounts[0];
        const accountOwnerSigner = accounts[1];
        const recipientSigner = accounts[2];
        const initialRecipientBalance: bigint = await ethers.provider.getBalance(accountOwnerSigner.getAddress());
        
        const ERC6551AccountFactory = await ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance: any = ERC6551AccountFactory.attach(ERC6551AccountAddress.toString()).connect(accountOwnerSigner);
        
        // Sending 1 ether from sender to accountOwner
        const fundAccount1Tx = await senderSigner.sendTransaction({
            to: accountOwnerSigner.getAddress(),
            value: parseEther("1.0")
        });
        await fundAccount1Tx.wait();
        
        // Using ERC6551Account to send 0.5 ether to recipient
        const sendEtherToRecipientTx = await ERC6551AccountInstance.execute(
            await recipientSigner.getAddress(),
            parseEther("0.5"),
            "0x",
            0,
            { value: parseEther("0.5") }
        );
        await sendEtherToRecipientTx.wait();
        
        const finalRecipientBalance: bigint = await ethers.provider.getBalance(recipientSigner.getAddress());
        const balanceDifference: bigint = finalRecipientBalance - initialRecipientBalance;
        expect(parseEther("0.5")).to.be.equal(balanceDifference);
    })

    it("should verify owner signature", async () => {
        const accountOwnerWallet = ethers.Wallet.fromPhrase("denial kitchen pet squirrel other broom bar gas better priority spoil cross")
        const accountOwner = accountOwnerWallet.deriveChild(0);

        await ERC721.mint(accountOwner.address, 2);

        const tx: TransactionResponse = await Registry.createAccount(
            await ERC6551Account.getAddress(),
            chainId,
            await ERC721.getAddress(),
            BigInt(2),
            2,
            "0x"
        );

        const receipt: TransactionReceipt | null = await tx.wait();

        const events = await RegistryInstance.queryFilter(RegistryInstance.filters.AccountCreated(), receipt?.blockNumber);
        const event = events[0];
        
        const accountOwnerContractAddress = await event.args[0];


        const ERC6551AccountFactory = await ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance: any = ERC6551AccountFactory.attach(accountOwnerContractAddress.toString());

        const message = getBytes("0xDEADBEEF");
        const hash = hashMessage(message);

        const signature = await accountOwner.signMessage(message);

        const isValidSignature = await ERC6551AccountInstance.isValidSignature(getBytes(hash), signature);

        const sigHash = id("isValidSignature(bytes32,bytes)").substring(0, 10);
        
        expect(isValidSignature).to.be.equal(sigHash);
    })

    it("should return a valid token", async () => {
        const ERC6551AccountFactory = await ethers.getContractFactory("ExampleERC6551Account");
        const ERC6551AccountInstance: any = ERC6551AccountFactory.attach(ERC6551AccountAddress.toString());

        const [_chainId, _tokenAddress, _tokenId] = await ERC6551AccountInstance.token();

        expect(_chainId).to.be.equal(_chainId);
        expect(_tokenAddress).to.be.equal(await ERC721.getAddress())
        expect(_tokenId).to.be.equal(BigInt(1));
        
    })

})