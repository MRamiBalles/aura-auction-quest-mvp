const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AuctionHouse - Security Tests", function () {
    let auctionHouse;
    let nft;
    let owner, seller, bidder1, bidder2, maliciousBidder;

    beforeEach(async function () {
        [owner, seller, bidder1, bidder2, maliciousBidder] = await ethers.getSigners();

        // Deploy NFT
        const NFT = await ethers.getContractFactory("AuraNFT");
        nft = await NFT.deploy();
        await nft.waitForDeployment();

        // Deploy AuctionHouse
        const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
        auctionHouse = await AuctionHouse.deploy();
        await auctionHouse.waitForDeployment();

        // Mint NFT to seller
        await nft.connect(seller).mint(seller.address);
        await nft.connect(seller).setApprovalForAll(await auctionHouse.getAddress(), true);
    });

    describe("P0-1: Infinite Extension Loop Prevention", function () {
        it("Should limit auction extensions to MAX_EXTENSIONS", async function () {
            // Create 1-hour auction
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("1"),
                3600 // 1 hour
            );

            // Fast forward to last 5 minutes
            await time.increase(3600 - 290); // 55 minutes

            // Place 7 bids (should only extend 6 times)
            for (let i = 0; i < 7; i++) {
                const bidAmount = ethers.parseEther((1 + i * 0.01).toString());
                await auctionHouse.connect(bidder1).placeBid(1, { value: bidAmount });

                // Wait a bit
                await time.increase(60);
            }

            // Check extension count
            const extensionCount = await auctionHouse.getExtensionCount(1);
            expect(extensionCount).to.equal(6); // Max 6 extensions

            // Verify ExtensionLimitReached event was emitted
            // (would need to capture events in the loop above)
        });

        it("Should stop extending after MAX_EXTENSIONS reached", async function () {
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("1"),
                3600
            );

            await time.increase(3300); // Near end

            // Place 6 bids to hit limit
            for (let i = 0; i < 6; i++) {
                await auctionHouse.connect(bidder1).placeBid(1, {
                    value: ethers.parseEther((1 + i * 0.01).toString())
                });
                await time.increase(60);
            }

            const auction1 = await auctionHouse.getAuction(1);
            const endTime1 = auction1.endTime;

            // 7th bid should not extend
            await auctionHouse.connect(bidder1).placeBid(1, {
                value: ethers.parseEther("2")
            });

            const auction2 = await auctionHouse.getAuction(1);
            const endTime2 = auction2.endTime;

            expect(endTime2).to.equal(endTime1); // No extension
        });
    });

    describe("P0-2: Failed Refund Handling", function () {
        it("Should not block auction if previous bidder refund fails", async function () {
            // Deploy malicious bidder contract that rejects ETH
            const MaliciousBidder = await ethers.getContractFactory("MaliciousReceiver");
            const maliciousBidderContract = await MaliciousBidder.deploy();

            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("1"),
                3600
            );

            // Malicious contract places bid
            await maliciousBidderContract.placeBid(
                await auctionHouse.getAddress(),
                1,
                { value: ethers.parseEther("1") }
            );

            // Normal user should still be able to bid
            await expect(
                auctionHouse.connect(bidder1).placeBid(1, {
                    value: ethers.parseEther("1.1")
                })
            ).to.not.be.reverted;

            // Check that failed refund was recorded
            const failedRefund = await auctionHouse.getFailedRefund(
                await maliciousBidderContract.getAddress()
            );
            expect(failedRefund).to.equal(ethers.parseEther("1"));
        });

        it("Should allow withdrawal of failed refunds", async function () {
            const MaliciousBidder = await ethers.getContractFactory("MaliciousReceiver");
            const maliciousBidderContract = await MaliciousBidder.deploy();

            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("1"),
                3600
            );

            // Setup failed refund scenario
            await maliciousBidderContract.placeBid(
                await auctionHouse.getAddress(),
                1,
                { value: ethers.parseEther("1") }
            );

            await auctionHouse.connect(bidder1).placeBid(1, {
                value: ethers.parseEther("1.1")
            });

            // Withdraw failed refund
            const balanceBefore = await ethers.provider.getBalance(
                await maliciousBidderContract.getAddress()
            );

            await maliciousBidderContract.withdrawFailedRefund(
                await auctionHouse.getAddress()
            );

            const balanceAfter = await ethers.provider.getBalance(
                await maliciousBidderContract.getAddress()
            );

            expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("1"));
        });
    });

    describe("NFT Transfer Failure Handling", function () {
        it("Should refund winner if NFT transfer fails", async function () {
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("1"),
                3600
            );

            await auctionHouse.connect(bidder1).placeBid(1, {
                value: ethers.parseEther("1")
            });

            // Seller revokes approval
            await nft.connect(seller).setApprovalForAll(
                await auctionHouse.getAddress(),
                false
            );

            // Fast forward to end
            await time.increase(3601);

            // Finalize should not revert, but should refund winner
            await auctionHouse.finalizeAuction(1);

            // Check winner's failed refund
            const refund = await auctionHouse.getFailedRefund(bidder1.address);
            expect(refund).to.equal(ethers.parseEther("1"));
        });
    });

    describe("Anti-Sniping Mechanism", function () {
        it("Should extend auction if bid in last 5 minutes", async function () {
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("1"),
                3600
            );

            const auction1 = await auctionHouse.getAuction(1);
            const originalEndTime = auction1.endTime;

            // Fast forward to last 4 minutes
            await time.increase(3600 - 240);

            // Place bid
            await auctionHouse.connect(bidder1).placeBid(1, {
                value: ethers.parseEther("1")
            });

            const auction2 = await auctionHouse.getAuction(1);
            const newEndTime = auction2.endTime;

            // Should be extended by 5 minutes
            expect(newEndTime - originalEndTime).to.equal(300);
        });

        it("Should not extend if bid more than 5 minutes before end", async function () {
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("1"),
                3600
            );

            const auction1 = await auctionHouse.getAuction(1);
            const originalEndTime = auction1.endTime;

            // Bid 10 minutes before end
            await time.increase(3600 - 600);

            await auctionHouse.connect(bidder1).placeBid(1, {
                value: ethers.parseEther("1")
            });

            const auction2 = await auctionHouse.getAuction(1);
            expect(auction2.endTime).to.equal(originalEndTime);
        });
    });

    describe("Minimum Bid Increment", function () {
        it("Should enforce 0.5% minimum bid increment", async function () {
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("100"),
                3600
            );

            await auctionHouse.connect(bidder1).placeBid(1, {
                value: ethers.parseEther("100")
            });

            // Try to bid only 0.1% more (should fail)
            await expect(
                auctionHouse.connect(bidder2).placeBid(1, {
                    value: ethers.parseEther("100.1")
                })
            ).to.be.revertedWith("Bid too low");

            // Bid 0.5% more (should succeed)
            await expect(
                auctionHouse.connect(bidder2).placeBid(1, {
                    value: ethers.parseEther("100.5")
                })
            ).to.not.be.reverted;
        });
    });

    describe("Auction Finalization", function () {
        it("Should distribute payments correctly on finalization", async function () {
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("100"),
                3600
            );

            await auctionHouse.connect(bidder1).placeBid(1, {
                value: ethers.parseEther("100")
            });

            await time.increase(3601);

            const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

            await auctionHouse.finalizeAuction(1);

            const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

            // Seller should receive 97.5 ETH (100 - 2.5% fee)
            expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(
                ethers.parseEther("97.5")
            );

            // Owner should receive 2.5 ETH fee
            expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(
                ethers.parseEther("2.5")
            );
        });

        it("Should handle auction with no bids", async function () {
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("100"),
                3600
            );

            await time.increase(3601);

            await expect(auctionHouse.finalizeAuction(1))
                .to.emit(auctionHouse, "AuctionCancelled")
                .withArgs(1);
        });
    });

    describe("Edge Cases", function () {
        it("Should prevent seller from bidding on own auction", async function () {
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("1"),
                3600
            );

            await expect(
                auctionHouse.connect(seller).placeBid(1, {
                    value: ethers.parseEther("1")
                })
            ).to.be.revertedWith("Seller cannot bid");
        });

        it("Should prevent bidding after auction ended", async function () {
            await auctionHouse.connect(seller).createAuction(
                await nft.getAddress(),
                1,
                ethers.parseEther("1"),
                3600
            );

            await time.increase(3601);

            await expect(
                auctionHouse.connect(bidder1).placeBid(1, {
                    value: ethers.parseEther("1")
                })
            ).to.be.revertedWith("Auction ended");
        });
    });
});
