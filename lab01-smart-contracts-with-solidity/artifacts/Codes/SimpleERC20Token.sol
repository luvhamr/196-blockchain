contract SimpleERC20Token {
    // Token details
    string public name = "SimpleToken";
    string public symbol = "STK";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // Mapping to store balances
    mapping(address => uint256) public balanceOf;

    // Event to log transfers
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Constructor to mint initial supply to the deployer
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    // Function to transfer tokens to another address
    function transfer(address _to, uint256 _amount) external returns (bool success) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");

        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }
}
