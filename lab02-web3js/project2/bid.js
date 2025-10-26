// Import web3
const Web3 = require('web3').default;
const web3 = new Web3("http://127.0.0.1:8545"); // Adjust to your provider (e.g., Ganache or Infura URL)

// Contract ABI and Address
const contractABI = require('./build/contracts/SimpleAuction.json').abi;
const contractAddress = "0xC6b8aBEE2E3dd82230BB5aabEc6832Bc248460FE";
const auctionContract = new web3.eth.Contract(contractABI, contractAddress);

async function placeBids() {
    try {
        const accounts = await web3.eth.getAccounts();

        // Define bid amounts in Wei
        const bidValues = [
            web3.utils.toWei("1", "ether"),
            web3.utils.toWei("2", "ether"),
            web3.utils.toWei("3", "ether")
        ];
        const bidders = [accounts[1], accounts[2], accounts[3]];

        console.log("Starting the bidding process...");

        // Place three bids
        for (let i = 0; i < bidValues.length; i++) {
            await auctionContract.methods.bid().send({ from: bidders[i], gas:500000, gasPrice: web3.utils.toWei('20', 'gwei'), value: bidValues[i] });
            console.log(`Bid ${i + 1} placed by ${bidders[i]} with value: ${web3.utils.fromWei(bidValues[i], "ether")} ETH`);
        }
    } catch (error) {
        console.error("Error placing bids:", error);
    }
}
placeBids();
