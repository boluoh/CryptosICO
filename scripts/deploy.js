async function main() {

    const [owner, deposit] = await ethers.getSigners();
  
    console.log(
      "Deploying contracts with the account:",
      await deposit.getAddress()
    );
    
    console.log("Account balance:", (await owner.getBalance()).toString());
  
    const CryptosICO = await ethers.getContractFactory("CryptosICO");
    const cryptosICO = await CryptosICO.deploy(deposit.getAddress());
  
    await cryptosICO.deployed();
  
    console.log("Token address:", cryptosICO.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });