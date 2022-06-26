// SPDX-License-Identifier: MIT

/**
                               _
     /\                       | |
    /  \   _ __ ___   __ _  __| | ___ _   _ ___
   / /\ \ | '_ ` _ \ / _` |/ _` |/ _ | | | / __|
  / ____ \| | | | | | (_| | (_| |  __| |_| \__ \
 /_/    \_|_| |_| |_|\__,_|\__,_|\___|\__,_|___/

 @developer:CivilLabs_Amadeus
*/

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC721A.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

library MerkleProof {
    /**
     * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
     * defined by `root`. For this, a `proof` must be provided, containing
     * sibling hashes on the branch from the leaf to the root of the tree. Each
     * pair of leaves and each pair of pre-images are assumed to be sorted.
     */
    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        return processProof(proof, leaf) == root;
    }

    /**
     * @dev Returns the rebuilt hash obtained by traversing a Merklee tree up
     * from `leaf` using `proof`. A `proof` is valid if and only if the rebuilt
     * hash matches the root of the tree. When processing the proof, the pairs
     * of leafs & pre-images are assumed to be sorted.
     *
     * _Available since v4.4._
     */
    function processProof(bytes32[] memory proof, bytes32 leaf)
        internal
        pure
        returns (bytes32)
    {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = _efficientHash(computedHash, proofElement);
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = _efficientHash(proofElement, computedHash);
            }
        }
        return computedHash;
    }

    function _efficientHash(bytes32 a, bytes32 b)
        private
        pure
        returns (bytes32 value)
    {
        assembly {
            mstore(0x00, a)
            mstore(0x20, b)
            value := keccak256(0x00, 0x40)
        }
    }
}

contract SphinxCat is Ownable, ERC721A, ReentrancyGuard {
    constructor(
        uint256 timeStartMintMystery_,
        uint256 timeUncoverNFT_,
        bytes32 merkleRoot_
    ) ERC721A("Sphinx Cat Magic Club", "SCMC", 1, 10000) {
        require(
            timeStartMintMystery_ < timeUncoverNFT_,
            "time to uncover NFT should after mint"
        );

        timeStartMintMystery = timeStartMintMystery_;
        timeUncoverNFT = timeUncoverNFT_;
        merkleRoot = merkleRoot_;
    }

    // For marketing etc.
    function reserveMint(uint256 quantity, address to) external onlyOwner {
        require(
            totalSupply() + quantity <= collectionSize,
            "too many already minted before dev mint"
        );
        uint256 numChunks = quantity / maxBatchSize;
        for (uint256 i = 0; i < numChunks; i++) {
            _safeMint(to, maxBatchSize);
        }
        if (quantity % maxBatchSize != 0) {
            _safeMint(to, quantity % maxBatchSize);
        }
    }

    // metadata URI
    string private _baseTokenURI;

    string private _baseTokenURIMystrey = "ipfs://";
    string private _baseTokenURIReal = "ipfs://";

    // user can mint NFT mystery box during _timeStartMintMystery and _timeUncoverNFT

    // when to mint NFT mystery box
    uint256 public timeStartMintMystery;

    // until when then NFT mystery box is uncovered automatically.
    uint256 public timeUncoverNFT;

    function _baseURI() internal view virtual override returns (string memory) {
        if (block.timestamp < timeUncoverNFT) {
            return _baseTokenURIMystrey;
        } else {
            return _baseTokenURIReal;
        }
    }

    function setBaseURI(
        string calldata baseURIMystrey_,
        string calldata baseTokenURIReal_
    ) external onlyOwner {
        _baseTokenURIMystrey = baseURIMystrey_;
        _baseTokenURIReal = baseTokenURIReal_;
    }

    function withdrawMoney() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    function setOwnersExplicit(uint256 quantity)
        external
        onlyOwner
        nonReentrant
    {
        _setOwnersExplicit(quantity);
    }

    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }

    function getOwnershipData(uint256 tokenId)
        external
        view
        returns (TokenOwnership memory)
    {
        return ownershipOf(tokenId);
    }

    function refundIfOver(uint256 price) private {
        require(msg.value >= price, "Need to send more ETH.");
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }

    // allowList mint
    uint256 public allowListMintPrice = 0.200000 ether;
    // default false
    bool public allowListStatus = false;
    uint256 public allowListMintAmount = 3500;
    uint256 public immutable maxPerAddressDuringMint = 1;
    uint256 public immutable allowListPerMint = 1;

    bytes32 public merkleRoot;

    mapping(address => bool) public allowListAppeared;
    mapping(address => uint256) public allowListStock;

    // payable 白名单用户铸造不需要付费（线下交易过了）只需要出Gas就行
    function allowListMint(uint256 quantity, bytes32[] memory proof) external {
        require(allowListStatus, "not begun");
        require(quantity <= allowListPerMint, "reached max amount per mint");

        require(
            totalSupply() + quantity <= collectionSize,
            "reached max supply"
        );
        require(allowListMintAmount >= quantity, "reached max amount");
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid Merkle Proof."
        );
        if (!allowListAppeared[msg.sender]) {
            allowListAppeared[msg.sender] = true;
            allowListStock[msg.sender] = maxPerAddressDuringMint;
        }
        require(
            allowListStock[msg.sender] >= quantity,
            "reached allow list per address mint amount"
        );
        allowListStock[msg.sender] -= quantity;
        _safeMint(msg.sender, quantity);
        allowListMintAmount -= quantity;
        // refundIfOver(allowListMintPrice * quantity);
    }

    // 团队保留的NFT（用于社区营销）
    uint256 public reservedMintAmount = 500;

    // 管理员为指定用户铸造NFT
    function mintTo(address to, uint256 quantity) external onlyOwner {
        require(reservedMintAmount >= quantity, "reached max amount");

        _safeMint(to, quantity);
        reservedMintAmount -= quantity;
    }

    function setRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
    }

    function setAllowListStatus(bool status) external onlyOwner {
        allowListStatus = status;
    }

    //public sale
    bool public publicSaleStatus = false;
    uint256 public publicPrice = 0.200000 ether;

    uint256 public amountForPublicSale = 6000;

    // per mint public sale limitation
    uint256 public immutable publicSalePerMint = 1;

    function publicSaleMint(uint256 quantity) external payable {
        require(publicSaleStatus, "not begun");
        require(
            totalSupply() + quantity <= collectionSize,
            "reached max supply"
        );
        require(amountForPublicSale >= quantity, "reached max amount");

        require(quantity <= publicSalePerMint, "reached max amount per mint");

        _safeMint(msg.sender, quantity);
        amountForPublicSale -= quantity;
        refundIfOver(uint256(publicPrice) * quantity);
    }

    function setPublicSaleStatus(bool status) external onlyOwner {
        publicSaleStatus = status;
    }

    function getCurrentPrice() external view returns (uint256 currentPrice) {
        uint256 publicMinted = 6000 - amountForPublicSale;

        if (publicMinted <= 3000) {
            currentPrice = 0.15 ether;
        } else if (publicMinted > 3000 && publicMinted <= 6000) {
            currentPrice = 0.2 ether;
        }
    }
}
