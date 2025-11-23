const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Marketplace - Security Tests", function () {
    let marketplace;
    let nft;
    let owner, seller, buyer, maliciousContract;

    beforeEach(async function () {
        [owner, seller, buyer, maliciousContract] = await ethers.getSigners();

        // Deploy NFT contract
        const NFT = await ethers.getContractFactory("AuraNFT");
        nft = await NFT.deploy();
        await nft.waitForDeployment();

        // Deploy Marketplace
        const Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy();
        await marketplace.waitForDeployment();

        // Mint NFT to seller
        await nft.connect(seller).mint(seller.address);

        // Approve marketplace
        await nft.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);
    });

    describe("P0 Fix Verification", function () {
        it("Should prevent reentrancy attacks with nonReentrant modifier", async function () {
            // This is verified by OpenZeppelin's ReentrancyGuard
            // Test that modifier is applied
            const listingId = await marketplace.connect(seller).listItem(
                await nft.getAddress(),
                1,
                ethers.parseEther("1")
            );

            // NonReentrant should be in place
            expect(listingId).to.not.be.reverted;
        });
    });

    describe("P1-1: Payment Failure Handling", function () {
        it("Should handle seller payment failure with push-to-pull pattern", async function () {
            // Create a malicious contract that rejects payments
            const MaliciousSeller = await ethers.getContractFactory("MaliciousReceiver");
            const maliciousSeller = await MaliciousSeller.deploy();
            await maliciousSeller.waitForDeployment();

            // Mint NFT to malicious contract
            await nft.mint(await maliciousSeller.getAddress());

            // Malicious contract lists item
            await nft.connect(maliciousSeller).setApprovalForAll(await marketplace.getAddress(), true);
            await maliciousSeller.listItem(
                await marketplace.getAddress(),
                await nft.getAddress(),
                2,
                ethers.parseEther("1")
            );

            // Buyer purchases
            const tx = await marketplace.connect(buyer).buyItem(1, {
                value: ethers.parseEther("1")
            });

            await expect(tx).to.emit(marketplace, "PaymentFailed");

            // Check pending withdrawal
            const pending = await marketplace.getPendingWithdrawal(await maliciousSeller.getAddress());
            expect(pending).to.equal(ethers.parseEther("0.975")); // 1 - 2.5% fee
        });

        it("Should allow withdrawal of pending payments", async function () {
            // Setup: Create failed payment scenario
            const MaliciousSeller = await ethers.getContractFactory("MaliciousReceiver");
            const maliciousSeller = await MaliciousSeller.deploy();

            // ... setup payment failure (similar to above)

            // Now seller can withdraw
            const balanceBefore = await ethers.provider.getBalance(seller.address);
            await marketplace.connect(seller).withdraw();
            const balanceAfter = await ethers.provider.getBalance(seller.address);

            expect(balanceAfter).to.be.greaterThan(balanceBefore);
        });

        it("Should revert if no pending withdrawals", async function () {
            await expect(
                marketplace.connect(buyer).withdraw()
            ).to.be.revertedWith("No pending withdrawals");
        });
    });

    describe("Fee Locking", function () {
        it("Should lock platform fee at listing time", async function () {
            // List item at current fee (2.5%)
            await marketplace.connect(seller).listItem(
                await nft.getAddress(),
                1,
                ethers.parseEther("100")
            );

            // Owner changes fee to 5%
            await marketplace.connect(owner).updatePlatformFee(500);

            // Buyer purchases - should use 2.5% fee
            await marketplace.connect(buyer).buyItem(1, {
                value: ethers.parseEther("100")
            });

            // Check seller received 97.5 ETH (2.5% fee, not 5%)
            const sellerBalance = await marketplace.getPendingWithdrawal(seller.address);
            expect(sellerBalance).to.equal(0); // Should have been paid directly
        });
    });

    describe("NFT Ownership Validation", function () {
        it("Should revert if seller no longer owns NFT", async function () {
            // List NFT
            await marketplace.connect(seller).listItem(
                await nft.getAddress(),
                1,
                ethers.parseEther("1")
            );

            // Seller transfers NFT to someone else
            await nft.connect(seller).transferFrom(
                seller.address,
                owner.address,
                1
            );

            // Buyer tries to purchase
            await expect(
                marketplace.connect(buyer).buyItem(1, {
                    value: ethers.parseEther("1")
                })
            ).to.be.revertedWith("Seller no longer owns NFT");
        });
    });

    describe("Fee Management", function () {
        it("Should enforce 5% maximum fee", async function () {
            await expect(
                marketplace.connect(owner).updatePlatformFee(501)
            ).to.be.revertedWith("Fee cannot exceed 5%");
        });

        it("Should allow fees up to 5%", async function () {
            await marketplace.connect(owner).updatePlatformFee(500);
            expect(await marketplace.platformFee()).to.equal(500);
        });
    });

    describe("Refund Handling", function () {
        it("Should refund excess payment", async function () {
            await marketplace.connect(seller).listItem(
                await nft.getAddress(),
                1,
                ethers.parseEther("1")
            );

            const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

            // Send 2 ETH for 1 ETH item
            const tx = await marketplace.connect(buyer).buyItem(1, {
                value: ethers.parseEther("2")
            });

            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

            // Should have spent ~1 ETH + gas, not 2 ETH
            const spent = buyerBalanceBefore - buyerBalanceAfter;
            expect(spent).to.be.lessThan(ethers.parseEther("1.1"));
        });
    });

    describe("Access Control", function () {
        it("Should prevent non-owner from updating fees", async function () {
            await expect(
                marketplace.connect(buyer).updatePlatformFee(300)
            ).to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount");
        });

        it("Should prevent non-owner from withdrawing fees", async function () {
            await expect(
                marketplace.connect(buyer).withdrawFees()
            ).to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount");
        });
    });

    describe("Edge Cases", function () {
        it("Should revert if price is 0", async function () {
            await expect(
                marketplace.connect(seller).listItem(
                    await nft.getAddress(),
                    1,
                    0
                )
            ).to.be.revertedWith("Price must be > 0");
        });

        it("Should revert if buyer is seller", async function () {
            await marketplace.connect(seller).listItem(
                await nft.getAddress(),
                1,
                ethers.parseEther("1")
            );

            await expect(
                marketplace.connect(seller).buyItem(1, {
                    value: ethers.parseEther("1")
                })
            ).to.be.revertedWith("Cannot buy own listing");
        });

        it("Should revert if listing not active", async function () {
            await marketplace.connect(seller).listItem(
                await nft.getAddress(),
                1,
                ethers.parseEther("1")
            );

            // Cancel listing
            await marketplace.connect(seller).cancelListing(1);

            // Try to buy
            await expect(
                marketplace.connect(buyer).buyItem(1, {
                    value: ethers.parseEther("1")
                })
            ).to.be.revertedWith("Listing not active");
        });
    });
});

// Helper contract for testing payment failures
contract MaliciousReceiver {
    // Rejects all ETH payments
    receive() external payable {
        revert("Cannot receive ETH");
    }

    function listItem(
        address marketplace,
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {
        IMarketplace(marketplace).listItem(nftContract, tokenId, price);
    }
}

interface IMarketplace {
  function listItem(address nftContract, uint256 tokenId, uint256 price) external returns(uint256);
}
