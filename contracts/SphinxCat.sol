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

/**
 * SphinxCat NFT 合约
 */
contract SphinxCat is Ownable, ERC721A, ReentrancyGuard {
    constructor(
        uint256 timeStartMintMystery_,
        uint256 timeUncoverNFT_,
        bytes32 merkleRoot_
    ) ERC721A("Sphinx Cat Magic Club", "SCMC", 500, 10000) {
        require(
            timeStartMintMystery_ < timeUncoverNFT_,
            "time to uncover NFT should after mint"
        );

        timeStartMintMystery = timeStartMintMystery_;
        timeUncoverNFT = timeUncoverNFT_;
        merkleRoot = merkleRoot_;
    }

    // metadata URI
    string private _baseTokenURIMystrey =
        "ipfs://bafybeielxy5wach4socvkzplakik67dioiuzqc56qydupuqyzsw5gj5ukm/";
    string private _baseTokenURIReal =
        "ipfs://bafybeielxy5wach4socvkzplakik67dioiuzqc56qydupuqyzsw5gj5ukm/";

    // user can mint NFT mystery box during _timeStartMintMystery and _timeUncoverNFT

    // when to mint NFT mystery box
    uint256 public timeStartMintMystery;

    // until when then NFT mystery box is uncovered automatically.
    uint256 public timeUncoverNFT;

    // 团队保留的NFT（用于社区营销）500 + 88
    uint256 public reservedMintAmount = 588; // private

    // For marketing etc.
    function reserveMint(uint256 quantity, address to) external onlyOwner {
        require(
            totalSupply() + quantity <= collectionSize,
            "too many already minted before dev mint"
        );
        require(reservedMintAmount >= quantity, "reached max amount");

        uint256 numChunks = quantity / maxBatchSize;
        for (uint256 i = 0; i < numChunks; i++) {
            _safeMint(to, maxBatchSize);
        }
        if (quantity % maxBatchSize != 0) {
            _safeMint(to, quantity % maxBatchSize);
        }

        reservedMintAmount -= quantity;
    }

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

    // 白名单用户的铸造价格
    uint256 public allowListMintAmount = 500;

    // 一个白名单用户最多可以铸造多少个NFT
    uint256 public immutable maxPerAddressDuringMint = 5;

    // 一次性可以铸造几个NFT
    uint256 public immutable allowListPerMint = 5;

    bytes32 public merkleRoot;

    mapping(address => bool) public allowListAppeared;
    mapping(address => uint256) public allowListStock;

    /**
     * 判断用户是否在白名单中
     */
    function isInAllowList(bytes32[] memory proof)
        public
        view
        returns (bool ret)
    {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        ret = MerkleProof.verify(proof, merkleRoot, leaf);
    }

    // payable 白名单用户铸造不需要付费（线下交易过了）只需要出Gas就行
    function allowListMint(uint256 quantity, bytes32[] memory proof) external {
        require(_isMintable(), "not mintable");
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
    }

    function setRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
    }

    // 只有区块时间在指定的时间范围内，才可以铸造
    function _isMintable() private view returns (bool) {
        return
            block.timestamp >= timeStartMintMystery &&
            totalSupply() < collectionSize;
    }

    // function isMintable() external view returns (bool) {
    //     return _isMintable();
    // }

    function getCollectionSize() external view returns (uint256 ret) {
        ret = collectionSize;
    }

    // 剩余可铸造的数量
    function amountMintable() external view returns (uint256 ret) {
        if (!allowListAppeared[msg.sender]) {
            // 不做初始化，这里只做判断，返回最大铸造值
            ret = maxPerAddressDuringMint;
        } else {
            ret = allowListStock[msg.sender];
        }
    }

    // 可公开铸造的NFT总量
    uint256 public immutable PUBLIC_SALE_AMOUNT = 8912;
    uint256 public immutable PUBLIC_SALE_STAGE_ONE_AMOUNT = 3000; // 第一阶段销售的数量
    uint256 public immutable PUBLIC_SALE_STAGE_TWO_AMOUNT = 6912; // 第二阶段销售的数量

    uint256 private stageOnePrice = 0.15 ether; // 第一阶段销售的数量
    uint256 private stageTwoPrice = 0.2 ether; // 第二阶段销售的数量

    // 剩余可公开铸造的NFT数量
    uint256 public amountForPublicSale = 8912;

    // per mint public sale limitation
    uint256 public immutable publicSalePerMint = 5;

    function publicSaleMint(uint256 quantity) external payable {
        require(_isMintable(), "not mintable");
        require(
            totalSupply() + quantity <= collectionSize,
            "reached max supply"
        );
        require(amountForPublicSale >= quantity, "reached max amount");

        require(quantity <= publicSalePerMint, "reached max amount per mint");

        _safeMint(msg.sender, quantity);
        amountForPublicSale -= quantity;

        uint256 currentPrice = getCurrentPrice();
        refundIfOver(uint256(currentPrice) * quantity);
    }

    function getCurrentPrice() public view returns (uint256 currentPrice) {
        uint256 publicMinted = PUBLIC_SALE_AMOUNT - amountForPublicSale;

        if (publicMinted <= PUBLIC_SALE_STAGE_ONE_AMOUNT) {
            currentPrice = stageOnePrice; // todo: 这个价格以后会调整吗？
            return currentPrice;
        } else if (
            publicMinted > PUBLIC_SALE_STAGE_ONE_AMOUNT &&
            publicMinted <= PUBLIC_SALE_STAGE_TWO_AMOUNT
        ) {
            currentPrice = stageTwoPrice;
            return currentPrice;
        }

        // 逻辑应该走不到这里，或者在这里报错
        currentPrice = stageTwoPrice;
    }

    // 修改销售价格（应该是用不到，以防运营修改策略）
    // For TEST
    function setPrice(uint256 _stageOnePrice, uint256 _stageTwoPrice)
        external
        onlyOwner
    {
        stageOnePrice = _stageOnePrice;
        stageTwoPrice = _stageTwoPrice;
    }

    // 修改盲盒开启的时间
    // For TEST
    function setTime(uint256 _timeStartMintMystery, uint256 _timeUncoverNFT)
        external
        onlyOwner
    {
        timeStartMintMystery = _timeStartMintMystery;
        timeUncoverNFT = _timeUncoverNFT;
    }

    function contractURI() public view returns (string memory) {
        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, symbol()))
                : "";
    }
}
