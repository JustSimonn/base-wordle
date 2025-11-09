// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BaseWordleLeaderboard {
    struct Player {
        uint256 totalGames;
        uint256 totalScore;
        uint256 lastScore;
    }

    mapping(address => Player) public players;
    address[] public playerList;

    // Dev fee config
    address public owner;
    address payable public devWallet;
    uint256 public devFeeWei;

    event ScoreSaved(address indexed player, uint256 score, uint256 totalGames);
    event DevFeeUpdated(uint256 newFeeWei);
    event DevWalletUpdated(address newWallet);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ✅ Hardcoded dev wallet and fee
    constructor() {
        owner = msg.sender;
        devWallet = payable(0x3a40a53b39D24d51D8aC40234f0663946040E020);
        devFeeWei = 1000000000000; // 0.000001 ETH (~$0.0025)
    }

    function setDevFeeWei(uint256 _newFeeWei) external onlyOwner {
        devFeeWei = _newFeeWei;
        emit DevFeeUpdated(_newFeeWei);
    }

    function setDevWallet(address payable _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid dev wallet");
        devWallet = _newWallet;
        emit DevWalletUpdated(_newWallet);
    }

    function saveScore(uint256 score) external payable {
        require(score > 0, "Invalid score");
        require(msg.value >= devFeeWei, "Insufficient dev fee");

        // Forward required fee and refund excess
        (bool sent, ) = devWallet.call{value: devFeeWei}("");
        require(sent, "Fee transfer failed");
        if (msg.value > devFeeWei) {
            (bool refund, ) = msg.sender.call{value: msg.value - devFeeWei}("");
            require(refund, "Refund failed");
        }

        Player storage player = players[msg.sender];

        if (player.totalGames == 0) {
            playerList.push(msg.sender);
        }

        player.totalGames += 1;
        player.totalScore += score;
        player.lastScore = score;

        emit ScoreSaved(msg.sender, score, player.totalGames);
    }

    function getLeaderboard() external view returns (
        address[] memory, 
        uint256[] memory, 
        uint256[] memory
    ) {
        uint256 length = playerList.length;
        address[] memory addresses = new address[](length);
        uint256[] memory scores = new uint256[](length);
        uint256[] memory games = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address playerAddr = playerList[i];
            Player storage player = players[playerAddr];
            addresses[i] = playerAddr;
            scores[i] = player.totalScore;
            games[i] = player.totalGames;
        }

        return (addresses, scores, games);
    }

    function getPlayerStats(address playerAddr) external view returns (
        uint256 totalGames,
        uint256 totalScore,
        uint256 lastScore
    ) {
        Player memory player = players[playerAddr];
        return (player.totalGames, player.totalScore, player.lastScore);
    }
}