// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FunctionTypesExample {
    // State variable to demonstrate function types
    uint public data;

    // Constructor to initialize state variable
    constructor(uint _data) {
        data = _data;
    }

// Visibility-based 
 
// PUBLIC FUNCTION
    // Public functions can be called externally and internally
    function setData(uint _data) public {
        data = _data;  // Modify the state variable
    }

// PRIVATE FUNCTION
    // Private functions can only be called inside the contract they are defined in
    function _doubleData() private view returns (uint) {
        return data * 2;  // Internal use only
    }

// INTERNAL FUNCTION
    // Internal functions can be called inside the contract or derived (child) contracts
    function getDoubleData() internal view returns (uint) {
        return _doubleData();  // Internal function using private helper function
    }

// EXTERNAL FUNCTION
    // External functions can only be called externally (from outside the contract)
    function externalDoubleData() external view returns (uint) {
        return _doubleData();  // Use internal logic for external access
    }

//State Mutability Functions

// VIEW FUNCTION
    // View functions do not modify state, they only read from it. They can return public variables
    function getData() public view returns (uint) {
        return data;  // Return the current value of state variable
    }

// PURE FUNCTION
    // Pure functions do not read or modify state variables, they only use local variables
    function addNumbers(uint a, uint b) public pure returns (uint) {
        return a + b;  // Pure calculation, no state interaction
    }

    // A public function calling an internal function
    function callInternalFunction() public view returns (uint) {
        return getDoubleData();  // Public function calling an internal one
    }

// PAYABLE FUNCTION
 // Mapping to store Ether balances of each user
    mapping(address => uint256) public balances;

    // A payable function to accept Ether and record balance
    // 'payable' allows the function to receive Ether
    function deposit() public payable {
        // Ensure some Ether is sent with the transaction
        require(msg.value > 0, "Must send some Ether");

        // Increase sender's balance by the amount of Ether sent
        balances[msg.sender] += msg.value;
    }

    // A view function to check the contract's total balance
    // 'view' means it doesn't modify blockchain state
    function getContractBalance() public view returns (uint256) {
        // Returns the total Ether stored in the contract
        return address(this).balance;
    }

    // A function to withdraw Ether from the contract
    function withdraw(uint256 amount) public {
        // Ensure the caller has enough funds to withdraw
        require(balances[msg.sender] >= amount, "Insufficient funds");

        // Deduct the withdrawal amount from the sender’s balance
        balances[msg.sender] -= amount;

        // Transfer the requested amount back to the sender’s wallet
        payable(msg.sender).transfer(amount);
    }
}
