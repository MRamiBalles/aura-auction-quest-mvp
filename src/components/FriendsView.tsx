import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserPlus, Swords, Check, X, Search } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';

interface Friend {
    address: string;
    username: string;
    status: 'pending' | 'accepted';
    level: number;
    online: boolean;
}

const FriendsView = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
    const [searchAddress, setSearchAddress] = useState('');
    const { account } = useWeb3();

    useEffect(() => {
        // TODO: Fetch from API /social/friends
        const mockFriends: Friend[] = [
            { address: '0x1234...5678', username: 'CryptoKing', status: 'accepted', level: 42, online: true },
            { address: '0x2345...6789', username: 'AuraHunter', status: 'accepted', level: 35, online: false },
            { address: '0x3456...7890', username: 'NFTCollector', status: 'accepted', level: 28, online: true },
        ];

        const mockPending: Friend[] = [
            { address: '0x4567...8901', username: 'NewPlayer', status: 'pending', level: 12, online: false },
        ];

        setFriends(mockFriends);
        setPendingRequests(mockPending);
    }, []);

    const handleAddFriend = async () => {
        if (!searchAddress) {
            toast.error('Enter wallet address or ENS');
            return;
        }

        try {
            toast.info('Sending friend request...');
            // TODO: Call API /social/friends/add
            toast.success('Friend request sent!');
            setSearchAddress('');
        } catch (error) {
            toast.error('Failed to send friend request');
        }
    };

    const handleAcceptFriend = async (address: string) => {
        try {
            toast.info('Accepting friend request...');
            // TODO: Call API /social/friends/accept/:id
            toast.success('Friend added!');
            setPendingRequests(prev => prev.filter(f => f.address !== address));
        } catch (error) {
            toast.error('Failed to accept request');
        }
    };

    const handleChallengeToDuel = async (address: string, username: string) => {
        toast.info(`Challenging ${username} to a duel...`);
        // TODO: Initiate PvP duel with specific opponent
    };

    return (
        <div className="min-h-screen p-6 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold glow-text flex items-center gap-2">
                        <Users className="w-8 h-8 text-primary" />
                        Friends
                    </h1>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-muted-foreground">
                            {friends.filter(f => f.online).length} online
                        </span>
                    </div>
                </div>

                {/* Add Friend */}
                <Card className="p-4 space-y-3">
                    <h2 className="font-bold flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Add Friend
                    </h2>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter wallet address or ENS name"
                                value={searchAddress}
                                onChange={(e) => setSearchAddress(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleAddFriend}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Send Request
                        </Button>
                    </div>
                </Card>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <Card className="p-4 space-y-3">
                        <h2 className="font-bold flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-accent" />
                            Pending Requests ({pendingRequests.length})
                        </h2>
                        <div className="space-y-2">
                            {pendingRequests.map((friend) => (
                                <motion.div
                                    key={friend.address}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 bg-gradient-to-br from-accent to-secondary">
                                            <AvatarFallback className="bg-transparent text-white font-bold">
                                                {friend.username.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold">{friend.username}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {friend.address} • Level {friend.level}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                            onClick={() => setPendingRequests(prev => prev.filter(f => f.address !== friend.address))}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-primary to-secondary"
                                            onClick={() => handleAcceptFriend(friend.address)}
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Accept
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Friends List */}
                <Card className="p-4 space-y-3">
                    <h2 className="font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        My Friends ({friends.length})
                    </h2>
                    <div className="space-y-2">
                        {friends.map((friend, index) => (
                            <motion.div
                                key={friend.address}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="w-12 h-12 bg-gradient-to-br from-primary to-secondary">
                                            <AvatarFallback className="bg-transparent text-white font-bold">
                                                {friend.username.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {friend.online && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            {friend.username}
                                            {friend.online && (
                                                <span className="text-xs text-green-500">Online</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {friend.address} • Level {friend.level}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-primary/50"
                                    onClick={() => handleChallengeToDuel(friend.address, friend.username)}
                                    disabled={!friend.online}
                                >
                                    <Swords className="w-4 h-4 mr-1" />
                                    Challenge
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {friends.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No friends yet</p>
                            <p className="text-sm">Add friends to challenge them to duels!</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default FriendsView;
