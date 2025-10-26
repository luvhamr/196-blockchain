// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ModifierExample {
    // State variable to store the owner of the contract
    address public owner;

    // Constructor to set the contract deployer as the owner
    constructor() {
        owner = msg.sender;  // msg.sender is the address that deployed the contract
    }

    // Modifier to check if the caller is the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;  // Placeholder for the function body
    }

    // Function that can only be called by the owner
    function changeOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    // A public function that anyone can call (no restriction)
    function publicFunction() public pure returns (string memory) {
        return "This function is public and can be called by anyone";
    }

    // A restricted function that only the owner can call
    function restrictedFunction() public view onlyOwner returns (string memory) {
        return "This function can only be called by the contract owner";
    }
}
