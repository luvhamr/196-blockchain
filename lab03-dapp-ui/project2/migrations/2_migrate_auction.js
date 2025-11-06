const SimpleAuction = artifacts.require("SimpleAuction");
module.exports = async function (deployer) {
    // Set the auction duration and the beneficiary address. 
    const accounts = await web3.eth.getAccounts();
    const biddingTime = 600; // Example: auction duration is 10 minutes (600 seconds)
    const beneficiaryAddress = accounts[0]; // Example: beneficiary is the deployer
    await deployer.deploy(SimpleAuction, biddingTime, beneficiaryAddress,);
};
