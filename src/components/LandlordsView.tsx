/**
 * LandlordsView - Main UI for Aura Landlords virtual real estate feature.
 * 
 * Displays:
 * - Owned parcels with map preview
 * - Pending taxes with withdraw button
 * - Improvement management
 * - Claim new parcel interface
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 1.0.0
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Coins,
    TreePine,
    Shield,
    Sparkles,
    ArrowLeft,
    Plus,
    ExternalLink,
    Clock,
    TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLandlords, IMPROVEMENT_INFO, ImprovementType } from '@/contexts/LandlordsContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';

interface LandlordsViewProps {
    onBack?: () => void;
}

const LandlordsView: React.FC<LandlordsViewProps> = ({ onBack }) => {
    const {
        ownedParcels,
        pendingTaxes,
        isLoading,
        claimParcel,
        buildImprovement,
        withdrawTaxes,
        getBackendSignature
    } = useLandlords();
    const { account, connectWallet } = useWeb3();

    const [selectedParcel, setSelectedParcel] = useState<number | null>(null);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleWithdraw = async () => {
        setIsProcessing(true);
        try {
            const success = await withdrawTaxes();
            if (success) {
                toast.success('¡Impuestos retirados!', {
                    description: `AURA añadidos a tu wallet`,
                    icon: '💰',
                });
            } else {
                toast.error('Error al retirar impuestos');
            }
        } catch (error: any) {
            toast.error('Error', { description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * SECURE FLOW:
     * 1. Get GPS coordinates
     * 2. Request signature from backend (proves physical presence)
     * 3. Call contract with signature + MATIC payment
     */
    const handleClaimHere = async () => {
        if ('geolocation' in navigator) {
            setIsProcessing(true);

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // Step 1: Get backend signature (proves GPS location)
                        toast.loading('Verificando ubicación...', { id: 'claim' });
                        const signature = await getBackendSignature(latitude, longitude);

                        if (!signature) {
                            toast.error('No se pudo verificar tu ubicación', { id: 'claim' });
                            setIsProcessing(false);
                            return;
                        }

                        // Step 2: Call contract with signature + payment
                        toast.loading('Esperando confirmación de Metamask...', { id: 'claim' });
                        const success = await claimParcel(latitude, longitude, signature);

                        if (success) {
                            toast.success('¡Parcela reclamada!', {
                                id: 'claim',
                                description: 'Ahora ganas 5% de los cristales recolectados aquí',
                                icon: '🏠',
                            });
                            setShowClaimModal(false);
                        } else {
                            toast.error('Error al reclamar parcela', { id: 'claim' });
                        }
                    } catch (error: any) {
                        toast.error('Error', { id: 'claim', description: error.message });
                    } finally {
                        setIsProcessing(false);
                    }
                },
                () => {
                    toast.error('No se pudo obtener tu ubicación');
                    setIsProcessing(false);
                }
            );
        }
    };

    const handleBuildImprovement = async (parcelId: number, improvement: ImprovementType) => {
        setIsProcessing(true);
        try {
            const success = await buildImprovement(parcelId, improvement);
            if (success) {
                const info = IMPROVEMENT_INFO[improvement];
                toast.success(`${info.emoji} ${info.name} construido`, {
                    description: info.description,
                });
                setSelectedParcel(null);
            } else {
                toast.error('Error al construir mejora');
            }
        } catch (error: any) {
            toast.error('Error', { description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const getImprovementIcon = (type: ImprovementType) => {
        switch (type) {
            case 'AURA_TREE': return <TreePine className="w-4 h-4 text-green-400" />;
            case 'SHRINE': return <Sparkles className="w-4 h-4 text-yellow-400" />;
            case 'DEFENSE_GRID': return <Shield className="w-4 h-4 text-blue-400" />;
            default: return null;
        }
    };

    if (!account) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="p-8 text-center max-w-md">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-aura-purple" />
                    <h2 className="text-2xl font-bold mb-2">Aura Landlords</h2>
                    <p className="text-muted-foreground mb-6">
                        Conecta tu wallet para ver tus propiedades virtuales
                    </p>
                    <Button onClick={connectWallet} className="w-full">
                        Conectar Wallet
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-aura-purple" />
                        Mis Propiedades
                    </h1>
                    <Button
                        onClick={() => setShowClaimModal(true)}
                        className="bg-gradient-to-r from-aura-purple to-aura-cyan"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Reclamar
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-aura-purple/20 to-transparent border-aura-purple/30">
                        <div className="text-sm text-muted-foreground">Parcelas</div>
                        <div className="text-3xl font-bold text-aura-purple">{ownedParcels.length}</div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-transparent border-yellow-500/30">
                        <div className="text-sm text-muted-foreground">Impuestos Pendientes</div>
                        <div className="text-2xl font-bold text-yellow-400">{pendingTaxes.toFixed(1)} AURA</div>
                        {pendingTaxes > 0 && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 w-full text-xs"
                                onClick={handleWithdraw}
                                disabled={isLoading}
                            >
                                <Coins className="w-3 h-3 mr-1" />
                                Retirar
                            </Button>
                        )}
                    </Card>
                </div>

                {/* Total Earnings */}
                <Card className="p-4 bg-card/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <div>
                            <div className="text-sm text-muted-foreground">Total Ganado</div>
                            <div className="font-bold">
                                {ownedParcels.reduce((sum, p) => sum + p.totalTaxEarned, 0).toFixed(1)} AURA
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        5% de cada cristal recolectado
                    </div>
                </Card>
            </div>

            {/* Parcels List */}
            <div className="px-6 space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground">Tus Parcelas</h3>

                {ownedParcels.length === 0 ? (
                    <Card className="p-8 text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Aún no tienes parcelas. ¡Camina a una ubicación y reclámala!
                        </p>
                    </Card>
                ) : (
                    ownedParcels.map((parcel) => (
                        <motion.div
                            key={parcel.tokenId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card
                                className="p-4 hover:border-aura-purple/50 transition-colors cursor-pointer"
                                onClick={() => setSelectedParcel(parcel.tokenId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Mini map preview */}
                                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-aura-purple/30 to-aura-cyan/30 flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-aura-purple" />
                                        </div>

                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                Parcela #{parcel.tokenId}
                                                {parcel.improvement !== 'NONE' && getImprovementIcon(parcel.improvement)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {parcel.latitude.toFixed(4)}, {parcel.longitude.toFixed(4)}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(parcel.claimedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-lg font-bold text-yellow-400">
                                            {parcel.totalTaxEarned.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">AURA ganados</div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Claim Modal */}
            <AnimatePresence>
                {showClaimModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowClaimModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Card className="p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-aura-purple" />
                                    Reclamar Parcela
                                </h2>

                                <p className="text-muted-foreground mb-4">
                                    Reclama la parcela de 100m × 100m en tu ubicación actual.
                                    Ganarás el 5% de todos los cristales que otros jugadores
                                    recolecten aquí.
                                </p>

                                <div className="bg-aura-purple/10 rounded-lg p-4 mb-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-muted-foreground">Coste</span>
                                        <span className="font-bold">10 MATIC</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Impuesto</span>
                                        <span className="font-bold text-green-400">5% perpetuo</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowClaimModal(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-aura-purple to-aura-cyan"
                                        onClick={handleClaimHere}
                                        disabled={isLoading}
                                    >
                                        <MapPin className="w-4 h-4 mr-1" />
                                        Reclamar Aquí
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Parcel Detail / Improvement Modal */}
            <AnimatePresence>
                {selectedParcel !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50"
                        onClick={() => setSelectedParcel(null)}
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg"
                        >
                            <Card className="p-6 rounded-b-none">
                                {(() => {
                                    const parcel = ownedParcels.find(p => p.tokenId === selectedParcel);
                                    if (!parcel) return null;

                                    return (
                                        <>
                                            <h2 className="text-xl font-bold mb-4">
                                                Parcela #{parcel.tokenId}
                                            </h2>

                                            {parcel.improvement === 'NONE' ? (
                                                <>
                                                    <p className="text-muted-foreground mb-4">
                                                        Construye una mejora para aumentar las ganancias de esta parcela.
                                                    </p>

                                                    <div className="space-y-2">
                                                        {(['AURA_TREE', 'SHRINE', 'DEFENSE_GRID'] as ImprovementType[]).map((type) => {
                                                            const info = IMPROVEMENT_INFO[type];
                                                            return (
                                                                <Button
                                                                    key={type}
                                                                    variant="outline"
                                                                    className="w-full justify-between h-auto py-3"
                                                                    onClick={() => handleBuildImprovement(parcel.tokenId, type)}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xl">{info.emoji}</span>
                                                                        <div className="text-left">
                                                                            <div className="font-bold">{info.name}</div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {info.description}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-yellow-400 font-bold">
                                                                        {info.cost} MATIC
                                                                    </span>
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <span className="text-4xl mb-2 block">
                                                        {IMPROVEMENT_INFO[parcel.improvement].emoji}
                                                    </span>
                                                    <div className="font-bold">
                                                        {IMPROVEMENT_INFO[parcel.improvement].name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {IMPROVEMENT_INFO[parcel.improvement].description}
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                variant="ghost"
                                                className="w-full mt-4"
                                                onClick={() => setSelectedParcel(null)}
                                            >
                                                Cerrar
                                            </Button>
                                        </>
                                    );
                                })()}
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandlordsView;
