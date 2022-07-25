
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Cryptos ICO", function () {

    let CryptosICO;
    let ico;
    let owner;
    let deposit;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        CryptosICO = await ethers.getContractFactory("CryptosICO");
        [owner, deposit, addr1, addr2, addr3] = await ethers.getSigners();

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

        it("Should init raisedAmount with 0 ether", async function () {
            expect(await ico.raisedAmount()).to.equal(0);
        });
    });

    describe("Invest", function () {
        it("Should fail invest with ether > 5", async function () {
            await expect(ico.connect(addr1).invest({ value: ethers.utils.parseEther("6") })).to.be.revertedWith("invest value must between 0.1 ether and 5 ether");
            expect(await ico.balanceOf(addr1.getAddress())).to.equal(0);
        });
        it("Should fail invest with ether < 0.1", async function () {
            await expect(ico.connect(addr1).invest({ value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("invest value must between 0.1 ether and 5 ether");
            expect(await ico.balanceOf(addr1.getAddress())).to.equal(0);
        });
        it("Should success invest ether = 1 and get 1000 tokens", async function () {
            expect(await ico.connect(addr1).invest({ value: ethers.utils.parseEther("1") }));
            expect(await ico.raisedAmount()).to.equal(ethers.utils.parseEther("1"));
            expect(await ico.balanceOf(addr1.getAddress())).to.equal(1000);
            expect(await ico.balanceOf(owner.getAddress())).to.equal(9000);
        });
        it("Should fail invest because over hardCap", async function () {
            expect(await ico.connect(addr1).invest({ value: ethers.utils.parseEther("1") }));
            await expect(ico.connect(addr2).invest({ value: ethers.utils.parseEther("4.5") })).to.be.revertedWith("over hardCap");
            expect(await ico.balanceOf(addr2.getAddress())).to.equal(0);
            expect(await ico.balanceOf(owner.getAddress())).to.equal(9000);
        });
    });

    describe("Transaction", function () {
        it("Should fail transaction because not yet tokenTradeStart", async function () {
            expect(await ico.connect(addr1).invest({ value: ethers.utils.parseEther("1") }));
            expect(await ico.connect(addr2).invest({ value: ethers.utils.parseEther("2") }));
            expect(await ico.connect(addr3).invest({ value: ethers.utils.parseEther("2") }));
            expect(await ico.raisedAmount()).to.equal(ethers.utils.parseEther("5"));
            expect(await ico.balanceOf(addr1.getAddress())).to.equal(1000);
            expect(await ico.balanceOf(addr2.getAddress())).to.equal(2000);
            expect(await ico.balanceOf(addr3.getAddress())).to.equal(2000);

            await expect(ico.connect(addr1).transfer(addr2.getAddress(), 1000)).to.be.revertedWith("not yet tokenTradeStart");
        });
        it("Should success transaction after 2weeks", async function () {
            expect(await ico.connect(addr1).invest({ value: ethers.utils.parseEther("1") }));
            expect(await ico.connect(addr2).invest({ value: ethers.utils.parseEther("2") }));
            expect(await ico.connect(addr3).invest({ value: ethers.utils.parseEther("2") }));
            expect(await ico.raisedAmount()).to.equal(ethers.utils.parseEther("5"));
            expect(await ico.balanceOf(addr1.getAddress())).to.equal(1000);
            expect(await ico.balanceOf(addr2.getAddress())).to.equal(2000);
            expect(await ico.balanceOf(addr3.getAddress())).to.equal(2000);

            await ethers.provider.send('evm_increaseTime', [604800 + 604800]);
            // await ethers.provider.send('evm_mine');
            
            expect(await ico.connect(addr1).transfer(addr2.getAddress(), 1000));
            expect(await ico.balanceOf(addr1.getAddress())).to.equal(0);
            expect(await ico.balanceOf(addr2.getAddress())).to.equal(3000);
            expect(await ico.raisedAmount()).to.equal(ethers.utils.parseEther("5"));
            
        });
    });


});