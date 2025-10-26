//storage.js
// Replace with your deployed contract's address
 	const Web3 = require('web3').default;
// Connect to Ethereum provider (update the URL if needed)
const web3 = new Web3('http://127.0.0.1:8545');

const contractAddress = '<your deployed contract address>';
// Replace with your deployed contract's ABI
const contractABI = require('./build/contracts/storage.json').abi;
// Create a contract instance
const storageContract = new web3.eth.Contract(contractABI, contractAddress);

// Example account (replace with a valid account from Ganache or your provider)
const account = '<Your account address from ganache-cli>';
// Function to store a number in the contract
async function storeNumber(number) {
    try {
        const tx = await storageContract.methods.store(number).send({ from: account, gas:50000, gasPrice: web3.utils.toWei('20', 'gwei') });
//        from: account,
//        gas: 50000,  // Set a reasonable gas limit
//        gasPrice: web3.utils.toWei('20', 'gwei')  // Set gas price for legacy networks
        console.log(`Stored ${number} in the contract. Transaction Hash: ${tx.transactionHash}`);
    } catch (error) {
        console.error('Error storing number:', error);
    }
}
// Function to retrieve the stored number
async function retrieveNumber() {
    try {
        const number = await storageContract.methods.retrieve().call();
    //        from: account,
  //          gas: 50000,  // Set a reasonable gas limit
//            gasPrice: web3.utils.toWei('20', 'gwei')  // Set gas price for legacy networks
        console.log(`Retrieved number from the contract: ${number}`);
    } catch (error) {
        console.error('Error retrieving number:', error);
    }
}
// Example usage
(async () => {
    // Store a number
    await storeNumber(42);
    // Retrieve the stored number
    await retrieveNumber();
})();
