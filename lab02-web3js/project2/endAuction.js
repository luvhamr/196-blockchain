const Web3 = require('web3').default;
const web3 = new Web3("http://127.0.0.1:8545"); // Adjust to your provider URL

// Contract ABI and Address
const contractABI = require('./build/contracts/SimpleAuction.json').abi;
const contractAddress = "<your contract address goes here>";

const auctionContract = new web3.eth.Contract(contractABI, contractAddress);

async function endAuction() {
    try {
        const accounts = await web3.eth.getAccounts();

        // End the auction
        await auctionContract.methods.auctionEnd().send({ from: accounts[0] , gas:500000, gasPrice: web3.utils.toWei('20', 'gwei')});
        console.log("Auction ended successfully.");

        // Get and print the final results
        const highestBid = await auctionContract.methods.highestBid().call();
        const highestBidder = await auctionContract.methods.highestBidder().call();
        console.log(`Highest bid was: ${web3.utils.fromWei(highestBid, "ether")} ETH by ${highestBidder}`);
    } catch (error) {
        console.error("Error ending the auction:", error);
    }
}
endAuction();
