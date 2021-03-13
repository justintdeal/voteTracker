pragma solidity ^0.5.16;

contract VoteTracker {
    struct Item {
        string name;
        uint256 voteCount;
        uint256 id;
    }

    mapping(uint256 => Item) public items;
    mapping(address => bool) public voters;

    uint256 public itemCount;

    constructor() public {
        addItem("Bitcoin");
        addItem("Ethereum");
        addItem("Litecoin");
        addItem("Filecoin");
        addItem("Dogecoin");
    }

    function addItem(string memory _name) private {
        itemCount++;
        items[itemCount] = Item(_name, 0, itemCount);
    }

    function vote(uint256 _itemId) public {
        require(!voters[msg.sender]);
        require(_itemId > 0 && _itemId <= itemCount);

        voters[msg.sender] = true;
        items[_itemId].voteCount++;
    }
}
