// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TuklasArtMarketplace is ERC721URIStorage, ReentrancyGuard, Ownable {
    // Structure to represent an art piece
    struct Art {
        uint256 id;
        string title;
        string uri; // IPFS hash or URL to the artwork metadata (e.g., IPFS hash)
        address payable artist;
        uint256 price;
        bool isApproved;
        bool isSold;
        bool isMinted;
    }

    // State variables
    uint256 public artCount = 0;
    mapping(uint256 => Art) public artPieces;

    // Events
    event ArtSubmitted(uint256 artId, string title, address artist);
    event ArtApproved(uint256 artId);
    event ArtMinted(uint256 artId, address artist);
    event ArtSold(uint256 artId, address buyer);
    event EtherReceived(address from, uint256 amount);

    // Constructor to set the token name and symbol
    constructor() ERC721("TuklasArt", "TUKLAS") {}

    // Function to submit a new art piece
    function submitArt(
        string memory _title,
        string memory _uri,
        uint256 _price
    ) public {
        artCount++;
        artPieces[artCount] = Art(
            artCount,
            _title,
            _uri,
            payable(msg.sender),
            _price,
            false, // isApproved is initially false
            false, // isSold is initially false
            false // isMinted is initially false
        );
        emit ArtSubmitted(artCount, _title, msg.sender);
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
        require(!art.isSold, "Artwork is already sold");
        require(msg.value >= art.price, "Insufficient funds");

        uint256 excessAmount = msg.value - art.price;
        if (excessAmount > 0) {
            payable(msg.sender).transfer(excessAmount); // Refund excess to buyer
        }

        // Transfer the payment to the artist
        art.artist.transfer(art.price);
        art.isSold = true;

        // Transfer the NFT ownership to the buyer
        _transfer(art.artist, msg.sender, _artId);

        emit ArtSold(_artId, msg.sender);
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
