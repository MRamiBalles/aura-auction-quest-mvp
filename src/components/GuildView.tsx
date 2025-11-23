import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Users, Crown, MapPin, TrendingUp, Plus } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';

interface Guild {
    id: string;
    name: string;
    description: string;
    founder: string;
    members: string[];
    level: number;
    totalScore: number;
    territory: Array<{ lat: number; lon: number; radius: number }>;
}

const GuildView = () => {
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [myGuild, setMyGuild] = useState<Guild | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGuildName, setNewGuildName] = useState('');
    const [newGuildDesc, setNewGuildDesc] = useState('');
    const { account } = useWeb3();

    useEffect(() => {
        // TODO: Fetch from API /social/guilds
        const mockGuilds: Guild[] = [
            {
                id: '1',
                name: 'Crystal Hunters',
                description: 'Elite AR hunters seeking legendary crystals',
                founder: '0x1234...5678',
                members: ['0x1234...5678', '0x2345...6789', '0x3456...7890'],
                level: 5,
                totalScore: 15420,
                territory: [{ lat: 40.7128, lon: -74.0060, radius: 5000 }]
            },
            {
                id: '2',
                name: 'Aura Warriors',
                description: 'Dominating PvP and territory control',
                founder: '0x4567...8901',
                members: ['0x4567...8901', '0x5678...9012'],
                level: 3,
                totalScore: 8900,
                territory: []
            }
        ];
        setGuilds(mockGuilds);

        // Check if user is in a guild
        const userGuild = mockGuilds.find(g => g.members.includes(account?.toLowerCase() || ''));
        setMyGuild(userGuild || null);
    }, [account]);

    const handleCreateGuild = async () => {
        if (!newGuildName || !newGuildDesc) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            toast.info('Creating guild...');
            // TODO: Call API /social/guilds/create
            toast.success('Guild created successfully!');
            setShowCreateModal(false);
            setNewGuildName('');
            setNewGuildDesc('');
        } catch (error) {
            toast.error('Failed to create guild');
        }
    };

    const handleJoinGuild = async (guildId: string) => {
        try {
            toast.info('Joining guild...');
            // TODO: Call API /social/guilds/:id/join
            toast.success('Joined guild successfully!');
        } catch (error) {
            toast.error('Failed to join guild');
        }
    };

    return (
        <div className="min-h-screen p-6 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold glow-text flex items-center gap-2">
                        <Shield className="w-8 h-8 text-primary" />
                        Guilds & Clans
                    </h1>
                    {!myGuild && (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-primary to-secondary"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Guild
                        </Button>
                    )}
                </div>

                {/* My Guild */}
                {myGuild && (
                    <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/50">
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Shield className="w-6 h-6 text-primary" />
                                        {myGuild.name}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">{myGuild.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-primary">Level {myGuild.level}</div>
                                    <div className="text-xs text-muted-foreground">{myGuild.totalScore.toLocaleString()} points</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="p-4 bg-card/50">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-8 h-8 text-primary" />
                                        <div>
                                            <div className="text-2xl font-bold">{myGuild.members.length}</div>
                                            <div className="text-xs text-muted-foreground">Members</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-card/50">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-8 h-8 text-accent" />
                                        <div>
                                            <div className="text-2xl font-bold">{myGuild.territory.length}</div>
                                            <div className="text-xs text-muted-foreground">Territories</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-card/50">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-8 h-8 text-green-400" />
                                        <div>
                                            <div className="text-2xl font-bold">#{guilds.findIndex(g => g.id === myGuild.id) + 1}</div>
                                            <div className="text-xs text-muted-foreground">Global Rank</div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Member List */}
                            <div className="space-y-2">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Members ({myGuild.members.length})
                                </h3>
                                <div className="space-y-1">
                                    {myGuild.members.map((member, index) => (
                                        <div key={member} className="flex items-center gap-2 p-2 bg-card/30 rounded">
                                            {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                                            <span className="text-sm font-mono">{member}</span>
                                            {index === 0 && <span className="text-xs text-yellow-400">Founder</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* All Guilds */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">All Guilds</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guilds.map((guild) => (
                            <motion.div
                                key={guild.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <Card className="p-4 space-y-3 bg-card/50 hover:border-primary/50 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-primary" />
                                                {guild.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{guild.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-primary">Lv{guild.level}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            {guild.members.length} members
                                        </div>
                                        <div className="font-bold">{guild.totalScore.toLocaleString()} pts</div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="w-full"
                                        variant={myGuild?.id === guild.id ? 'outline' : 'default'}
                                        onClick={() => handleJoinGuild(guild.id)}
                                        disabled={!!myGuild}
                                    >
                                        {myGuild?.id === guild.id ? 'Your Guild' : 'Join Guild'}
                                    </Button>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Create Guild Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-md"
                        >
                            <Card className="p-6 space-y-4">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-primary" />
                                    Create New Guild
                                </h2>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Guild Name</label>
                                    <Input
                                        placeholder="Enter guild name"
                                        value={newGuildName}
                                        onChange={(e) => setNewGuildName(e.target.value)}
                                        maxLength={30}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Description</label>
                                    <Textarea
                                        placeholder="Describe your guild's purpose and goals"
                                        value={newGuildDesc}
                                        onChange={(e) => setNewGuildDesc(e.target.value)}
                                        maxLength={200}
                                        rows={4}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-primary to-secondary"
                                        onClick={handleCreateGuild}
                                    >
                                        Create Guild
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuildView;
