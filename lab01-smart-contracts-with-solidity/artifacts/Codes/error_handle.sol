// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ErrorHandlingExample {
    // State variable to store user balances
    mapping(address => uint) public balances;
    address public owner;

    // Constructor to set the contract owner
    constructor() {
        owner = msg.sender;
    }

    // Modifier to check if the caller is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the contract owner");
        _;
    }

    // Function to deposit Ether into the contract
    function deposit() public payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        balances[msg.sender] += msg.value;
    }

    // Function to withdraw Ether from the contract
    function withdraw(uint amount) public {
        // Check if the sender has enough balance
        require(amount <= balances[msg.sender], "Insufficient balance");

        // Perform the withdrawal
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    // Function to transfer Ether between users (with complex condition and revert)
    function transfer(address to, uint amount) public {
        require(amount > 0, "Transfer amount must be greater than 0");
        require(to != address(0), "Invalid address");

        // Ensure the sender has enough balance
        if (balances[msg.sender] < amount) {
            revert("Sender does not have enough balance");
        }

        // Transfer the amount
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    // Function that can only be called by the contract owner
    function resetBalance(address user) public onlyOwner {
        // Reset balance to 0 for a specific user
        balances[user] = 0;
    }

    // Function to validate an internal operation using assert
    function validateInternalState() public view returns (bool) {
        // Ensure the contract owner has a balance greater than or equal to 0
        uint balance = balances[owner];

        // The balance of the owner should never be negative (this is a logical check)
        assert(balance >= 0);  // This should always hold, else there's a serious bug

        return true;  // If the assert passes, return true
    }
}
