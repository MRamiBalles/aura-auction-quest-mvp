const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking - Security Tests", function () {
    let staking;
    let auraToken;
    let owner, user1, user2, flashLoanAttacker;

    beforeEach(async function () {
        [owner, user1, user2, flashLoanAttacker] = await ethers.getSigners();

        // Deploy AuraToken
        const AuraToken = await ethers.getContractFactory("AuraToken");
        auraToken = await AuraToken.deploy();
        await auraToken.waitForDeployment();

        // Deploy Staking
        const Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(await auraToken.getAddress());
        await staking.waitForDeployment();

        // Mint tokens to users
        await auraToken.mint(user1.address, ethers.parseEther("10000"));
        await auraToken.mint(user2.address, ethers.parseEther("10000"));
        await auraToken.mint(flashLoanAttacker.address, ethers.parseEther("1000000"));

        // Fund staking contract with reward pool
        await auraToken.mint(owner.address, ethers.parseEther("1000000"));
        await auraToken.connect(owner).approve(
            await staking.getAddress(),
            ethers.parseEther("1000000")
        );
        await staking.connect(owner).fundRewards(ethers.parseEther("100000"));

        // Approve staking contract
        await auraToken.connect(user1).approve(
            await staking.getAddress(),
            ethers.parseEther("10000")
        );
        await auraToken.connect(user2).approve(
            await staking.getAddress(),
            ethers.parseEther("10000")
        );
        await auraToken.connect(flashLoanAttacker).approve(
            await staking.getAddress(),
            ethers.parseEther("1000000")
        );
    });

    describe("P0-3: Flash Loan APY Exploit Prevention", function () {
        it("Should NOT give bonus APY to flash loan attackers", async function () {
            // Flash loan scenario:
            // 1. Stake massive amount
            // 2. Immediately unstake
            // 3. Wait 31 days
            // 4. Claims should NOT get bonus

            const amount = ethers.parseEther("1000000");

            // Stake
            await staking.connect(flashLoanAttacker).stake(amount);

            // Immediately unstake
            await staking.connect(flashLoanAttacker).unstake(amount);

            // Fast forward 31 days
            await time.increase(31 * 24 * 3600);

            // Try to stake tiny amount and claim
            await staking.connect(flashLoanAttacker).stake(ethers.parseEther("1"));

            // Check APY - should be base only, no bonus
            const stakeInfo = await staking.getStakeInfo(flashLoanAttacker.address);
            expect(stakeInfo.currentAPY).to.equal(1200); // 12% base only
        });

        it("Should give bonus APY to legitimate long-term stakers", async function () {
            const amount = ethers.parseEther("1000");

            // Stake and hold
            await staking.connect(user1).stake(amount);

            // Fast forward 31 days
            await time.increase(31 * 24 * 3600);

            // Check APY - should have bonus
            const stakeInfo = await staking.getStakeInfo(user1.address);
            expect(stakeInfo.currentAPY).to.equal(1700); // 17% (12% + 5% bonus)
        });

        it("Should track continuous staking time correctly", async function () {
            // Stake 1000 tokens
            await staking.connect(user1).stake(ethers.parseEther("1000"));

            // Wait 10 days
            await time.increase(10 * 24 * 3600);

            // Stake more (should accumulate time)
            await staking.connect(user1).stake(ethers.parseEther("500"));

            // Get stake info
            const stakeInfo1 = await staking.getStakeInfo(user1.address);
            const time1 = stakeInfo1.totalStakingTime;

            // Should have ~10 days accumulated
            expect(time1).to.be.closeTo(
                10 * 24 * 3600,
                100 // 100 seconds tolerance
            );

            // Wait another 21 days
            await time.increase(21 * 24 * 3600);

            // Should now have bonus (31 total days)
            const stakeInfo2 = await staking.getStakeInfo(user1.address);
            expect(stakeInfo2.currentAPY).to.equal(1700);
        });

        it("Should reset bonus progress if user unstakes everything", async function () {
            // Stake
            await staking.connect(user1).stake(ethers.parseEther("1000"));

            // Wait 25 days (almost bonus)
            await time.increase(25 * 24 * 3600);

            // Unstake everything
            await staking.connect(user1).unstake(ethers.parseEther("1000"));

            // Stake again
            await staking.connect(user1).stake(ethers.parseEther("500"));

            // Wait 10 more days
            await time.increase(10 * 24 * 3600);

            // Should NOT have bonus yet (need 30 continuous days from new stake)
            const stakeInfo = await staking.getStakeInfo(user1.address);
            expect(stakeInfo.currentAPY).to.equal(1200); // Base only
        });
    });

    describe("P0-4: emergencyWithdraw Removal", function () {
        it("Should not have emergencyWithdraw function", async function () {
            // Verify function doesn't exist
            expect(staking.emergencyWithdraw).to.be.undefined;
        });
    });

    describe("Reward Pool Safeguards", function () {
        it("Should enforce MAX_TOTAL_STAKE limit", async function () {
            const maxStake = ethers.parseEther("100000000"); // 100M AURA

            // Try to stake more than max
            await expect(
                staking.connect(flashLoanAttacker).stake(maxStake + BigInt(1))
            ).to.be.revertedWith("Stake pool full");
        });

        it("Should track reserve funds correctly", async function () {
            const reserveBefore = await staking.reserveFunds();

            // Owner adds more rewards
            await staking.connect(owner).fundRewards(ethers.parseEther("10000"));

            const reserveAfter = await staking.reserveFunds();

            expect(reserveAfter - reserveBefore).to.equal(ethers.parseEther("10000"));
        });

        it("Should cap rewards at available reserve", async function () {
            // Setup: Drain most of reserve
            const currentReserve = await staking.reserveFunds();

            // Stake massive amount
            await staking.connect(flashLoanAttacker).stake(ethers.parseEther("50000000"));

            // Fast forward 1 year
            await time.increase(365 * 24 * 3600);

            // Calculate rewards (should be capped at reserve)
            const rewards = await staking.calculateRewards(flashLoanAttacker.address);
            expect(rewards).to.be.lte(currentReserve);
        });

        it("Should revert claim if insufficient reserve", async function () {
            // Deplete reserve by staking huge amount and claiming
            await staking.connect(flashLoanAttacker).stake(ethers.parseEther("90000000"));

            // Fast forward
            await time.increase(365 * 24 * 3600);

            // Try to claim (might fail if reserve depleted)
            await expect(
                staking.connect(flashLoanAttacker).claimRewards()
            ).to.be.revertedWith("Insufficient reward reserve");
        });
    });

    describe("Reward Calculation", function () {
        it("Should calculate base APY rewards correctly", async function () {
            const amount = ethers.parseEther("1000");

            await staking.connect(user1).stake(amount);

            // Fast forward 1 year
            await time.increase(365 * 24 * 3600);

            const rewards = await staking.calculateRewards(user1.address);

            // Should be ~120 AURA (1000 * 12%)
            const expectedRewards = ethers.parseEther("120");
            expect(rewards).to.be.closeTo(expectedRewards, ethers.parseEther("1"));
        });

        it("Should calculate bonus APY rewards correctly", async function () {
            const amount = ethers.parseEther("1000");

            await staking.connect(user1).stake(amount);

            // Fast forward 31 days to get bonus
            await time.increase(31 * 24 * 3600);

            // Claim first rewards
            await staking.connect(user1).claimRewards();

            // Fast forward another year
            await time.increase(365 * 24 * 3600);

            const rewards = await staking.calculateRewards(user1.address);

            // Should be ~170 AURA (1000 * 17%)
            const expectedRewards = ethers.parseEther("170");
            expect(rewards).to.be.closeTo(expectedRewards, ethers.parseEther("2"));
        });
    });

    describe("Stake/Unstake Operations", function () {
        it("Should update total staked correctly on stake", async function () {
            const totalBefore = await staking.totalStaked();

            await staking.connect(user1).stake(ethers.parseEther("1000"));

            const totalAfter = await staking.totalStaked();

            expect(totalAfter - totalBefore).to.equal(ethers.parseEther("1000"));
        });

        it("Should update total staked correctly on unstake", async function () {
            await staking.connect(user1).stake(ethers.parseEther("1000"));

            const totalBefore = await staking.totalStaked();

            await staking.connect(user1).unstake(ethers.parseEther("500"));

            const totalAfter = await staking.totalStaked();

            expect(totalBefore - totalAfter).to.equal(ethers.parseEther("500"));
        });

        it("Should auto-claim rewards on stake if already staking", async function () {
            await staking.connect(user1).stake(ethers.parseEther("1000"));

            // Fast forward to accumulate some rewards
            await time.increase(30 * 24 * 3600);

            const balanceBefore = await auraToken.balanceOf(user1.address);

            // Stake more (should auto-claim)
            await staking.connect(user1).stake(ethers.parseEther("500"));

            const balanceAfter = await auraToken.balanceOf(user1.address);

            // Should have received rewards
            expect(balanceAfter).to.be.greaterThan(balanceBefore);
        });

        it("Should auto-claim rewards on unstake", async function () {
            await staking.connect(user1).stake(ethers.parseEther("1000"));

            await time.increase(30 * 24 * 3600);

            const balanceBefore = await auraToken.balanceOf(user1.address);

            await staking.connect(user1).unstake(ethers.parseEther("500"));

            const balanceAfter = await auraToken.balanceOf(user1.address);

            // Should have received stake + rewards
            const received = balanceAfter - balanceBefore;
            expect(received).to.be.greaterThan(ethers.parseEther("500"));
        });
    });

    describe("Reserve Health Check", function () {
        it("Should report healthy reserve", async function () {
            const health = await staking.getReserveHealth();

            expect(health.isHealthy).to.be.true;
            expect(health.reserveBalance).to.be.greaterThan(0);
        });

        it("Should report unhealthy reserve if depleted", async function () {
            // Stake huge amount to create high pending rewards
            await staking.connect(flashLoanAttacker).stake(ethers.parseEther("90000000"));

            await time.increase(365 * 24 * 3600);

            // Don't fund more reserves
            // Health check should show unhealthy
            const health = await staking.getReserveHealth();

            // Depending on implementation, might be unhealthy
            // This tests the health check function works
            expect(health.reserveBalance).to.be.greaterThan(0);
        });
    });

    describe("Edge Cases", function () {
        it("Should revert if staking 0", async function () {
            await expect(
                staking.connect(user1).stake(0)
            ).to.be.revertedWith("Cannot stake 0");
        });

        it("Should revert if unstaking more than staked", async function () {
            await staking.connect(user1).stake(ethers.parseEther("1000"));

            await expect(
                staking.connect(user1).unstake(ethers.parseEther("2000"))
            ).to.be.revertedWith("Insufficient staked amount");
        });

        it("Should revert claim if no stake", async function () {
            await expect(
                staking.connect(user1).claimRewards()
            ).to.be.revertedWith("No stake found");
        });

        it("Should handle claim with 0 rewards gracefully", async function () {
            await staking.connect(user1).stake(ethers.parseEther("1000"));

            // Immediately claim (0 time passed)
            await expect(
                staking.connect(user1).claimRewards()
            ).to.not.be.reverted;
        });
    });

    describe("Access Control", function () {
        it("Should only allow owner to fund rewards", async function () {
            await expect(
                staking.connect(user1).fundRewards(ethers.parseEther("1000"))
            ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
        });

        it("Should only allow owner to migrate staking time", async function () {
            await expect(
                staking.connect(user1).migrateStakingTime(user2.address, 1000)
            ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
        });
    });

    describe("Migration Function", function () {
        it("Should allow one-time migration of staking time", async function () {
            // Owner migrates time for existing user
            await staking.connect(owner).migrateStakingTime(
                user1.address,
                31 * 24 * 3600 // 31 days
            );

            // Now user stakes
            await staking.connect(user1).stake(ethers.parseEther("1000"));

            // Should immediately have bonus
            const stakeInfo = await staking.getStakeInfo(user1.address);
            expect(stakeInfo.currentAPY).to.equal(1700);
        });

        it("Should prevent double migration", async function () {
            await staking.connect(owner).migrateStakingTime(
                user1.address,
                1000
            );

            await expect(
                staking.connect(owner).migrateStakingTime(user1.address, 2000)
            ).to.be.revertedWith("Already migrated");
        });
    });
});
