// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EnumAndEventsExample {
    // Enum to track the status of a product's shipping
    enum ShippingStatus { Pending, Shipped, Delivered, Cancelled }

    // State variable to store the current status
    ShippingStatus public status;

    // Event to log status changes
    event StatusChanged(ShippingStatus newStatus);

    // Constructor to initialize the status to Pending
    constructor() {
        status = ShippingStatus.Pending;
        emit StatusChanged(status);  // Emit the initial status
    }

    // Function to update the shipping status to Shipped
    function shipProduct() public {
        require(status == ShippingStatus.Pending, "Product is not in Pending state");
        status = ShippingStatus.Shipped;
        emit StatusChanged(status);  // Emit event for status change
    }

    // Function to update the shipping status to Delivered
    function deliverProduct() public {
        require(status == ShippingStatus.Shipped, "Product is not in Shipped state");
        status = ShippingStatus.Delivered;
        emit StatusChanged(status);  // Emit event for status change
    }

    // Function to cancel the shipment
    function cancelProduct() public {
        require(status == ShippingStatus.Pending, "Product can only be cancelled if Pending");
        status = ShippingStatus.Cancelled;
        emit StatusChanged(status);  // Emit event for status change
    }

    // Function to get the current status as a string for easy reading
    function getStatus() public view returns (string memory) {
        if (status == ShippingStatus.Pending) {
            return "Pending";
        } else if (status == ShippingStatus.Shipped) {
            return "Shipped";
        } else if (status == ShippingStatus.Delivered) {
            return "Delivered";
        } else {
            return "Cancelled";
        }
    }
}
