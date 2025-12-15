import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

/**
 * 🔒 Account Abstraction Service
 * 
 * Manages "Ghost Wallets" for frictionless onboarding:
 * 1. Creates smart accounts for new users (no MetaMask required)
 * 2. Sponsors gas fees for first 10 transactions
 * 3. Handles upgrade to self-custody when user connects external wallet
 */
@Injectable()
export class AccountAbstractionService implements OnModuleInit {
    private readonly logger = new Logger(AccountAbstractionService.name);
    private provider: ethers.JsonRpcProvider | null = null;
    private adminWallet: ethers.Wallet | null = null;

    // Contract instances
    private factoryContract: ethers.Contract | null = null;
    private paymasterContract: ethers.Contract | null = null;

    // ABIs (simplified)
    private readonly FACTORY_ABI = [
        'function computeAddress(bytes32 salt, address owner) view returns (address)',
        'function createAccount(bytes32 salt, address owner) returns (address)',
        'function accountExists(bytes32 salt) view returns (bool)',
        'function getAccount(bytes32 salt) view returns (address)',
        'function generateSalt(string userIdentifier, uint256 nonce) pure returns (bytes32)',
    ];

    private readonly PAYMASTER_ABI = [
        'function canSponsor(address user, bytes4 selector) view returns (bool, string)',
        'function recordSponsorship(address user, uint256 gasUsed)',
        'function getUserStatus(address user) view returns (uint256, uint256, bool, uint256)',
        'function getDailyStatus() view returns (uint256, uint256, uint256, uint256)',
    ];

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        const rpcUrl = this.configService.get<string>('POLYGON_RPC_URL');
        const adminPrivateKey = this.configService.get<string>('ADMIN_PRIVATE_KEY');
        const factoryAddress = this.configService.get<string>('SMART_ACCOUNT_FACTORY_ADDRESS');
        const paymasterAddress = this.configService.get<string>('PAYMASTER_ADDRESS');

        if (!rpcUrl || !adminPrivateKey) {
            this.logger.warn('Account Abstraction not configured. Missing RPC or admin key.');
            return;
        }

        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.adminWallet = new ethers.Wallet(adminPrivateKey, this.provider);

            if (factoryAddress) {
                this.factoryContract = new ethers.Contract(
                    factoryAddress,
                    this.FACTORY_ABI,
                    this.adminWallet,
                );
            }

            if (paymasterAddress) {
                this.paymasterContract = new ethers.Contract(
                    paymasterAddress,
                    this.PAYMASTER_ABI,
                    this.adminWallet,
                );
            }

            this.logger.log('✅ Account Abstraction service initialized');
        } catch (error) {
            this.logger.error('Failed to initialize Account Abstraction', error);
        }
    }

    /**
     * Generate a deterministic salt for a user
     * @param userId Unique user identifier (email, social ID, etc.)
     */
    generateSalt(userId: string): string {
        return ethers.keccak256(ethers.toUtf8Bytes(`auraquest:${userId}`));
    }

    /**
     * Compute smart account address without deploying
     * Allows showing user their future address before any blockchain interaction
     */
    async computeAccountAddress(userId: string): Promise<string | null> {
        if (!this.factoryContract) {
            this.logger.warn('Factory contract not configured');
            return null;
        }

        try {
            const salt = this.generateSalt(userId);
            // Use admin wallet as initial owner (custodial)
            const owner = this.adminWallet?.address || ethers.ZeroAddress;
            return await this.factoryContract.computeAddress(salt, owner);
        } catch (error) {
            this.logger.error('Failed to compute address', error);
            return null;
        }
    }

    /**
     * Create a new smart account for a user
     * Called when user first interacts with blockchain features
     */
    async createSmartAccount(userId: string): Promise<{
        success: boolean;
        address?: string;
        error?: string;
    }> {
        if (!this.factoryContract) {
            return { success: false, error: 'Factory not configured' };
        }

        try {
            const salt = this.generateSalt(userId);

            // Check if already exists
            const exists = await this.factoryContract.accountExists(salt);
            if (exists) {
                const existingAddress = await this.factoryContract.getAccount(salt);
                return { success: true, address: existingAddress };
            }

            // Deploy new account
            const owner = this.adminWallet?.address;
            const tx = await this.factoryContract.createAccount(salt, owner);
            const receipt = await tx.wait();

            // Get created address from logs
            const createdAddress = await this.factoryContract.getAccount(salt);

            this.logger.log(`Created smart account ${createdAddress} for user ${userId}`);
            return { success: true, address: createdAddress };
        } catch (error) {
            this.logger.error('Failed to create smart account', error);
            return { success: false, error: 'Account creation failed' };
        }
    }

    /**
     * Check if user is eligible for gas sponsorship
     */
    async checkSponsorshipEligibility(
        userAddress: string,
        functionSelector: string,
    ): Promise<{ eligible: boolean; reason: string }> {
        if (!this.paymasterContract) {
            return { eligible: false, reason: 'Paymaster not configured' };
        }

        try {
            const [eligible, reason] = await this.paymasterContract.canSponsor(
                userAddress,
                functionSelector,
            );
            return { eligible, reason };
        } catch (error) {
            this.logger.error('Failed to check sponsorship', error);
            return { eligible: false, reason: 'Check failed' };
        }
    }

    /**
     * Get user's sponsorship status
     */
    async getUserSponsorshipStatus(userAddress: string): Promise<{
        transactionsUsed: number;
        transactionsRemaining: number;
        isBlacklisted: boolean;
        lastSponsored: Date | null;
    } | null> {
        if (!this.paymasterContract) return null;

        try {
            const [txUsed, txRemaining, blacklisted, lastTimestamp] =
                await this.paymasterContract.getUserStatus(userAddress);

            return {
                transactionsUsed: Number(txUsed),
                transactionsRemaining: Number(txRemaining),
                isBlacklisted: blacklisted,
                lastSponsored: Number(lastTimestamp) > 0
                    ? new Date(Number(lastTimestamp) * 1000)
                    : null,
            };
        } catch (error) {
            this.logger.error('Failed to get user status', error);
            return null;
        }
    }

    /**
     * Record a sponsored transaction (called after tx succeeds)
     */
    async recordSponsorship(userAddress: string, gasUsed: number): Promise<boolean> {
        if (!this.paymasterContract) return false;

        try {
            const tx = await this.paymasterContract.recordSponsorship(userAddress, gasUsed);
            await tx.wait();
            this.logger.log(`Recorded sponsorship for ${userAddress}: ${gasUsed} gas`);
            return true;
        } catch (error) {
            this.logger.error('Failed to record sponsorship', error);
            return false;
        }
    }

    /**
     * Execute a transaction on behalf of a smart account
     * This is the core "gasless" function - backend pays gas
     */
    async executeForUser(
        smartAccountAddress: string,
        targetContract: string,
        calldata: string,
        value: string = '0',
    ): Promise<{ success: boolean; txHash?: string; error?: string }> {
        if (!this.adminWallet || !this.provider) {
            return { success: false, error: 'Service not configured' };
        }

        try {
            // Create smart account interface
            const smartAccount = new ethers.Contract(
                smartAccountAddress,
                ['function execute(address,uint256,bytes) returns (bytes)'],
                this.adminWallet,
            );

            // Execute transaction
            const tx = await smartAccount.execute(
                targetContract,
                ethers.parseEther(value),
                calldata,
            );
            const receipt = await tx.wait();

            this.logger.log(`Executed tx for ${smartAccountAddress}: ${receipt.hash}`);
            return { success: true, txHash: receipt.hash };
        } catch (error) {
            this.logger.error('Failed to execute for user', error);
            return { success: false, error: 'Execution failed' };
        }
    }

    /**
     * Get daily gas budget status
     */
    async getDailyBudgetStatus(): Promise<{
        budget: string;
        spent: string;
        remaining: string;
    } | null> {
        if (!this.paymasterContract) return null;

        try {
            const [budget, spent, remaining] = await this.paymasterContract.getDailyStatus();
            return {
                budget: ethers.formatEther(budget),
                spent: ethers.formatEther(spent),
                remaining: ethers.formatEther(remaining),
            };
        } catch (error) {
            this.logger.error('Failed to get daily status', error);
            return null;
        }
    }
}
