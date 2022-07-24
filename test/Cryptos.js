
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Cryptos ICO", function () {

    let ico;
    let owner;
    let deposit;
    let addr1;
    let addrs;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        const CryptosICO = await ethers.getContractFactory("CryptosICO");
        [owner, deposit, addr1, ...addrs] = await ethers.getSigners();

        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens onces its transaction has been
        // mined.
        ico = await CryptosICO.deploy(deposit.getAddress());
        await ico.deployed();

    });

    describe("Deployment", function () {
        // `it` is another Mocha function. This is the one you use to define your
        // tests. It receives the test name, and a callback function.

        
        // If the callback function is async, Mocha will `await` it.
        it("Should set the right admin", async function () {
            expect(await ico.admin()).to.equal(await owner.getAddress());
        });
        it("Should set the right deposit", async function () {
            expect(await ico.deposit()).to.equal(await deposit.getAddress());
        });


        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await ico.balanceOf(owner.getAddress());
            expect(await ico.totalSupply()).to.equal(ownerBalance);
        });

        it("Should init cryptos with 10000 token", async function () {
            expect(await ico.totalSupply()).to.equal(10000);
        });
    });

    
});