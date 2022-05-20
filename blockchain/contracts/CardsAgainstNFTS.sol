// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

/// @title Cards Against NFTs

/**

    How the game works:

    1. Every day, a new base phrase is shown.
    2. Users may come up with new creative phrases that are related to the base phrase.
    3. Users may vote on the creative phrases.
    4. The winner is the user who has the most votes.
    5. The winner(s) phrase(s) are shown to the public.

    Winning Condition:

    1. Response for the base phrase should have the highest number of votes.
    2. If there is a tie, the first person who mints the NFT will get the rights to mint the card.

    Anti Bot Measures:
    1. 1 user can only vote once.
    2. (TODO) User must own a proof of humanity to vote.
    3. (TODO) User must own a proof of humanity to respond

    Other Notes:
    Responses and votes are stored off-chain to save compute cost


 */

contract CardsAgainstNFTS is ERC721 {
    using Strings for uint256;
    using ECDSA for bytes32;

    uint256 constant roundTime = 1 days;
    uint256 public startTime;
    address public deployer;
    uint256 public _totalSupply;


    // HTML Render Engine
    // URL Params: base, response
    string private baseURI =
        "https://bafkreicipfq7w3wbirik3e2jqtu7ywsrl2lxcomtig3p3czwnr553ul6am.ipfs.nftstorage.link/";

    string[] public basesPhrases = [
        "NFTs are",
        "ETH will",
        "Blockchain is going to",
        "Bitcoin was created by",
        "Satashi Nakamoto is",
        "Instead of buying NFTs, I should have"
        "I should have bought",
        "I should have sold"
    ];

    struct Response {
        address winner;
        string basePhrase;
        string response;
        uint256 votes;
    }

    // Events
    event MintCard(
        uint256 indexed tokenId,
        address indexed winner,
        string base,
        string response
    );

    mapping(uint256 => Response) public responses; // by token Id

    constructor() ERC721("CardsAgainstNFTs", "CAN") {
        deployer = msg.sender;
        startTime = block.timestamp;
    }

    // -------------------- MINT FUNCTIONS --------------------------

    /**
     * @dev Winner should mint the card
     * @param tokenId Token Id to Mint
     * @param response Response to the base phrase
     * @param tokenId Token Id to Mint
     */
    function mint(
        uint256 tokenId,
        string memory response,
        uint256 votes,
        bytes memory signature
    ) external {
        require(
            isAvailableForMint(tokenId),
            "CardsAgainstNFTs: Round is not over!"
        );
        require(
            !isMinted(tokenId),
            "CardsAgainstNFTs: Card has already been minted!"
        );

        // Offchain signature to determine if sender is the winner
        require(
            isValidSignature(msg.sender, tokenId, response, votes, signature),
            "CardsAgainstNFTs: Invalid Signature!"
        );

        // Set Winning Response for tokenId
        responses[tokenId] = Response(
            msg.sender,
            basesPhrases[tokenId],
            response,
            votes
        );

        _safeMint(msg.sender, tokenId);

        _totalSupply++;

        emit MintCard(tokenId, msg.sender, basesPhrases[tokenId], response);
    }

    // ---------------------- VIEW FUNCTIONS ------------------------
    /**
     * @dev See {IERC721Metadata-tokenURI}.
     * @dev gets baseURI from contract state variable
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "ERC721: Query for non-existent token");

        return
            string(
                abi.encodePacked(
                    baseURI,
                    "?base=",
                    getBasePhrase(tokenId),
                    "&response=",
                    getWinningResponse(tokenId)
                )
            );
    }

    /**
     * @dev Get the base phrase for a tokenId
     */
    function getBasePhrase(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        require(_exists(tokenId), "ERC721: Query for non-existent token");
        return basesPhrases[tokenId];
    }

    /**
     * @dev Get the winning phrase for a tokenId
     */
    function getWinningResponse(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        require(_exists(tokenId), "ERC721: Query for non-existent token");
        return responses[tokenId].response;
    }

    /**
     * @dev Verify offchain signature
     */
    function isValidSignature(
        address sender,
        uint256 tokenId,
        string memory response,
        uint256 votes,
        bytes memory signature
    ) private view returns (bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(sender, tokenId, response, votes)
        );
        console.log(deployer);
        console.log(hash.recover(signature));
        return deployer == hash.recover(signature);
    }

    /**
     * @dev Get the current round
     */
    function getCurrentRound() public view returns (uint256) {
        return (block.timestamp - startTime) / roundTime;
    }

    /**
     * @dev Check if a tokenId is available for minting
     */
    function isAvailableForMint(uint256 tokenId) public view returns (bool) {
        return getCurrentRound() > tokenId;
    }

    /**
     * @dev Check if a tokenId has already been minted
     */
    function isMinted(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
}
