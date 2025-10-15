// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StateVariablesExample {
    // State variables
    string public name;    // A string variable to store a name
    uint public age;       // An unsigned integer variable to store age
    bool public isActive;  // A boolean to store active status

    // Constructor to initialize the state variables
    constructor(string memory _name, uint _age, bool _isActive) {
        name = _name;      // Set the initial name
        age = _age;        // Set the initial age
        isActive = _isActive; // Set the initial active status
    }

    // Function to update the name
    function updateName(string memory newName) public {
        name = newName;
    }

    // Function to update the age
    function updateAge(uint newAge) public {
        age = newAge;
    }

    // Function to update the active status
    function updateActiveStatus(bool newStatus) public {
        isActive = newStatus;
    }

    // Function to get all state variables at once
    function getPersonInfo() public view returns (string memory, uint, bool) {
        return (name, age, isActive);
    }
}
