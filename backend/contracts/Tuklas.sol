// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TuklasArtMarketplace is ERC721URIStorage, ReentrancyGuard, Ownable {
    // Structure to represent an art piece
    struct Art {
        uint256 id;
        string title;
        string uri;
        string description;
        address payable artist;
        uint256 price;
        uint256 resalePrice;
        bool isApproved;
        bool isSold;
        bool isMinted;
    }

    // State variables
    uint256 public artCount = 0;
    mapping(uint256 => Art) public artPieces;
    address payable public adminWallet;

    // Events
    event ArtSubmitted(
        uint256 artId,
        string title,
        string description,
        address artist
    );
    event ArtApproved(uint256 artId);
    event ArtMinted(uint256 artId, address artist);
    event ArtSold(uint256 artId, address buyer, uint256 pricePaid);
    event ArtListedForSale(uint256 artId, uint256 price);
    event EtherReceived(address from, uint256 amount);

    // Constructor to set the token name, symbol, and initialize the owner and admin wallet
    constructor(
        address payable _adminWallet
    )
        ERC721("TuklasArt", "TUKLAS")
        Ownable(0x784a2430a204cCB93Fb9010008435e0A3cCA5675) //admin as the initial owner
    {
        adminWallet = _adminWallet;
    }

    // Function to submit a new art piece
    function submitArt(
        string memory _title,
        string memory _uri,
        uint256 _price,
        string memory _description
    ) public {
        artCount++;
        artPieces[artCount] = Art(
            artCount,
            _title,
            _uri,
            _description,
            payable(msg.sender),
            _price,
            0, // Initialize resale price
            false, // isApproved is initially false
            false, // isSold is initially false
            false // isMinted is initially false
        );
        emit ArtSubmitted(artCount, _title, _description, msg.sender);
    }

    // Admin function to approve art and mint NFT
    function approveAndMintArt(uint256 _artId) public onlyOwner {
        Art storage art = artPieces[_artId];
        require(!art.isApproved, "Artwork is already approved");
        require(!art.isSold, "Cannot approve sold artwork");

        // Approve the artwork
        art.isApproved = true;
        emit ArtApproved(_artId);

        // Mint the NFT after approval
        _safeMint(art.artist, _artId); // Mint the NFT to the artist
        _setTokenURI(_artId, art.uri); // Set the token URI (metadata)
        art.isMinted = true;

        emit ArtMinted(_artId, art.artist);
    }

    // Function to buy an approved and minted art piece (NFT)
    function buyArt(uint256 _artId) public payable nonReentrant {
        Art storage art = artPieces[_artId];
        require(art.isApproved, "Artwork not approved");
        require(art.isMinted, "Artwork not minted as an NFT yet");
        require(!art.isSold, "Artwork is already sold"); // Ensure the artwork is not already sold
        require(msg.value >= art.price, "Insufficient funds");

        uint256 excessAmount = msg.value - art.price;
        if (excessAmount > 0) {
            payable(msg.sender).transfer(excessAmount); // Refund excess to buyer
        }

        // Transfer the payment to the artist using call to handle potential gas issues
        (bool success, ) = art.artist.call{value: art.price}("");
        require(success, "Payment to artist failed");

        art.isSold = true;

        // Transfer the NFT ownership to the buyer
        _transfer(art.artist, msg.sender, _artId);

        emit ArtSold(_artId, msg.sender, art.price);
    }
    // Function to list an art piece for sale
    function listArtForSale(uint256 _artId, uint256 _price) public {
        require(
            ownerOf(_artId) == msg.sender,
            "Only the owner can list the art for sale"
        );
        Art storage art = artPieces[_artId];
        art.resalePrice = _price; // Set the resale price
        art.isSold = false; // Mark the art as available for sale

        emit ArtListedForSale(_artId, _price);
    }

    // Fallback function to accept ETH sent directly to the contract
    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    // Function for admin to withdraw contract's ETH balance
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
