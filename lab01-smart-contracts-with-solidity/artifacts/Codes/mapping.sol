// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MappingExample {

    // Mapping from address to uint (balance)
    mapping(address => uint) public balances;

    // Function to update the balance of the caller's address
    function updateBalance(uint _newBalance) public {
        balances[msg.sender] = _newBalance;
    }

    // Function to get the balance of a specific address
    function getBalance(address _user) public view returns (uint) {
        return balances[_user];
    }

    // Function to reset the balance of the caller's address to 0
    function resetBalance() public {
        balances[msg.sender] = 0;
    }
}