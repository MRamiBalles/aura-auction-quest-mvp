import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Coins, TrendingUp, Wallet, Gift, Info } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';

const StakingView = () => {
    const [stakedAmount, setStakedAmount] = useState('0');
    const [availableBalance, setAvailableBalance] = useState('1000'); // Mock
    const [pendingRewards, setPendingRewards] = useState('0');
    const [stakeInput, setStakeInput] = useState('');
    const [unstakeInput, setUnstakeInput] = useState('');
    const [currentAPY, setCurrentAPY] = useState(12);
    const [stakingDuration, setStakingDuration] = useState(0); // days
    const { account } = useWeb3();

    useEffect(() => {
        // TODO: Fetch from Staking contract
        // const staking = new ethers.Contract(STAKING_ADDRESS, StakingABI, provider);
        // const info = await staking.getStakeInfo(account);

        // Mock data
        setStakedAmount('500');
        setPendingRewards('12.5');
        setStakingDuration(45);
        setCurrentAPY(17); // Base 12% + 5% bonus (>30 days)

        // Update rewards every 10 seconds
        const interval = setInterval(() => {
            setPendingRewards(prev => (parseFloat(prev) + 0.01).toFixed(2));
        }, 10000);

        return () => clearInterval(interval);
    }, [account]);

    const handleStake = async () => {
        if (!stakeInput || parseFloat(stakeInput) <= 0) {
            toast.error('Enter valid amount');
            return;
        }

        if (parseFloat(stakeInput) > parseFloat(availableBalance)) {
            toast.error('Insufficient balance');
            return;
        }

        try {
            toast.info('Staking tokens...');
            // TODO: Call Staking.stake(amount)
            toast.success('Tokens staked successfully!');
            setStakeInput('');
        } catch (error) {
            toast.error('Staking failed');
        }
    };

    const handleUnstake = async () => {
        if (!unstakeInput || parseFloat(unstakeInput) <= 0) {
            toast.error('Enter valid amount');
            return;
        }

        if (parseFloat(unstakeInput) > parseFloat(stakedAmount)) {
            toast.error('Insufficient staked amount');
            return;
        }

        try {
            toast.info('Unstaking tokens...');
            // TODO: Call Staking.unstake(amount)
            toast.success('Tokens unstaked successfully!');
            setUnstakeInput('');
        } catch (error) {
            toast.error('Unstaking failed');
        }
    };

    const handleClaimRewards = async () => {
        if (parseFloat(pendingRewards) <= 0) {
            toast.error('No rewards to claim');
            return;
        }

        try {
            toast.info('Claiming rewards...');
            // TODO: Call Staking.claimRewards()
            toast.success(`Claimed ${pendingRewards} AURA!`);
            setPendingRewards('0');
        } catch (error) {
            toast.error('Claim failed');
        }
    };

    const calculateProjectedRewards = (amount: string, days: number) => {
        const principal = parseFloat(amount) || 0;
        const apy = currentAPY / 100;
        const dailyRate = apy / 365;
        return (principal * dailyRate * days).toFixed(2);
    };

    return (
        <div className="min-h-screen p-6 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold glow-text flex items-center justify-center gap-3">
                        <Coins className="w-10 h-10 text-yellow-400" />
                        AURA Staking
                    </h1>
                    <p className="text-muted-foreground">Earn passive rewards by staking your $AURA tokens</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Total Staked</div>
                            <div className="text-3xl font-bold text-primary">{stakedAmount} AURA</div>
                            <div className="text-xs text-muted-foreground">≈ ${(parseFloat(stakedAmount) * 0.5).toFixed(2)} USD</div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Current APY</div>
                            <div className="text-3xl font-bold text-yellow-400">{currentAPY}%</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {stakingDuration >= 30 ? '12% + 5% Bonus' : '12% Base Rate'}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Pending Rewards</div>
                            <div className="text-3xl font-bold text-green-400">{pendingRewards} AURA</div>
                            <div className="text-xs text-muted-foreground">Updating in real-time</div>
                        </div>
                    </Card>
                </div>

                {/* Staking Duration Info */}
                {stakingDuration > 0 && (
                    <Card className="p-4 bg-accent/10 border-accent/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                <div>
                                    <div className="font-bold">Staking Duration: {stakingDuration} days</div>
                                    <div className="text-xs text-muted-foreground">
                                        {stakingDuration >= 30 ? '🎉 Bonus APY Active!' : `${30 - stakingDuration} days until bonus`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Staking Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stake */}
                    <Card className="p-6 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            Stake AURA
                        </h2>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Available Balance</span>
                                <span className="font-bold">{availableBalance} AURA</span>
                            </div>
                            <Input
                                type="number"
                                placeholder="Amount to stake"
                                value={stakeInput}
                                onChange={(e) => setStakeInput(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStakeInput((parseFloat(availableBalance) * 0.25).toString())}
                                >
                                    25%
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStakeInput((parseFloat(availableBalance) * 0.5).toString())}
                                >
                                    50%
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStakeInput((parseFloat(availableBalance) * 0.75).toString())}
                                >
                                    75%
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStakeInput(availableBalance)}
                                >
                                    MAX
                                </Button>
                            </div>
                        </div>

                        {stakeInput && (
                            <Card className="p-3 bg-primary/5 border-primary/20">
                                <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Projected earnings (30d):</span>
                                        <span className="font-bold text-primary">{calculateProjectedRewards(stakeInput, 30)} AURA</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Projected earnings (365d):</span>
                                        <span className="font-bold text-primary">{calculateProjectedRewards(stakeInput, 365)} AURA</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <Button
                            className="w-full bg-gradient-to-r from-primary to-secondary"
                            onClick={handleStake}
                            disabled={!stakeInput || parseFloat(stakeInput) <= 0}
                        >
                            Stake Tokens
                        </Button>
                    </Card>

                    {/* Unstake */}
                    <Card className="p-6 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Gift className="w-5 h-5 text-yellow-400" />
                            Manage Stake
                        </h2>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Staked Amount</span>
                                <span className="font-bold">{stakedAmount} AURA</span>
                            </div>
                            <Input
                                type="number"
                                placeholder="Amount to unstake"
                                value={unstakeInput}
                                onChange={(e) => setUnstakeInput(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUnstakeInput((parseFloat(stakedAmount) * 0.25).toString())}
                                >
                                    25%
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUnstakeInput((parseFloat(stakedAmount) * 0.5).toString())}
                                >
                                    50%
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUnstakeInput(stakedAmount)}
                                >
                                    MAX
                                </Button>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleUnstake}
                            disabled={!unstakeInput || parseFloat(unstakeInput) <= 0}
                        >
                            Unstake Tokens
                        </Button>

                        <div className="pt-4 border-t">
                            <Button
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                                onClick={handleClaimRewards}
                                disabled={parseFloat(pendingRewards) <= 0}
                            >
                                <Gift className="w-4 h-4 mr-2" />
                                Claim {pendingRewards} AURA Rewards
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Info Card */}
                <Card className="p-6 bg-accent/5 border-accent/20">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-accent" />
                        How Staking Works
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• <strong>Base APY:</strong> 12% annual percentage yield on all staked tokens</p>
                        <p>• <strong>Long-term Bonus:</strong> +5% APY bonus after staking for 30+ days (17% total)</p>
                        <p>• <strong>No Lock-up:</strong> Unstake anytime with rewards automatically claimed</p>
                        <p>• <strong>Compound:</strong> Claim and re-stake rewards to maximize earnings</p>
                        <p>• <strong>Security:</strong> Smart contract audited by [Audit Firm Name]</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StakingView;
