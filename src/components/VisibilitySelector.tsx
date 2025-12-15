/**
 * VisibilitySelector - UI component for switching between visibility modes.
 * 
 * Displays 4 options with icons, showing premium badges on locked modes.
 * Integrates with VisibilityContext and triggers upgrade flow for premium.
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 1.0.0
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Palette, Lock, Crown, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVisibility, VisibilityMode } from '@/contexts/VisibilityContext';
import { toast } from 'sonner';

interface ModeOption {
    mode: VisibilityMode;
    label: string;
    description: string;
    icon: React.ReactNode;
    emoji: string;
    premium: boolean;
}

const modes: ModeOption[] = [
    {
        mode: 'PUBLIC',
        label: 'Público',
        description: 'Visible para todos en el mapa',
        icon: <Eye className="w-5 h-5" />,
        emoji: '🌍',
        premium: false,
    },
    {
        mode: 'GHOST',
        label: 'Ghost',
        description: 'Invisible para todos los jugadores',
        icon: <EyeOff className="w-5 h-5" />,
        emoji: '👻',
        premium: true,
    },
    {
        mode: 'AURA',
        label: 'Aura Mode',
        description: 'Otros ven tu aura, no tu posición exacta',
        icon: <Sparkles className="w-5 h-5" />,
        emoji: '⚡',
        premium: true,
    },
    {
        mode: 'DISGUISE',
        label: 'Disfraz',
        description: 'Apareces con un avatar diferente',
        icon: <Palette className="w-5 h-5" />,
        emoji: '🎭',
        premium: true,
    },
];

const VisibilitySelector: React.FC = () => {
    const { currentMode, isPremium, setVisibility, upgradeToPremium } = useVisibility();
    const [isOpen, setIsOpen] = useState(false);

    const handleModeSelect = (option: ModeOption) => {
        if (option.premium && !isPremium) {
            toast.error('Este modo requiere suscripción Premium', {
                description: 'Actualiza a Ghost Premium para desbloquear',
                action: {
                    label: 'Upgrade',
                    onClick: () => handleUpgrade(),
                },
            });
            return;
        }

        const success = setVisibility(option.mode);
        if (success) {
            toast.success(`Modo cambiado a ${option.label}`, {
                icon: option.emoji,
            });
            setIsOpen(false);
        }
    };

    const handleUpgrade = () => {
        // Mock upgrade - in production would open payment modal
        upgradeToPremium();
        toast.success('¡Bienvenido a Ghost Premium!', {
            description: 'Ahora puedes usar todos los modos de visibilidad',
            icon: '👻',
        });
    };

    const currentOption = modes.find(m => m.mode === currentMode) || modes[0];

    return (
        <div className="relative">
            {/* Current Mode Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-aura-purple/20 to-aura-cyan/20 border border-aura-purple/30 backdrop-blur-md"
            >
                <span className="text-xl">{currentOption.emoji}</span>
                <span className="text-sm font-medium text-white">{currentOption.label}</span>
                {isPremium && <Crown className="w-4 h-4 text-yellow-400" />}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 z-50"
                    >
                        <Card className="p-2 w-72 bg-black/90 border-aura-purple/30 backdrop-blur-xl">
                            <div className="space-y-1">
                                {modes.map((option) => {
                                    const isSelected = currentMode === option.mode;
                                    const isLocked = option.premium && !isPremium;

                                    return (
                                        <motion.button
                                            key={option.mode}
                                            whileHover={{ x: 4 }}
                                            onClick={() => handleModeSelect(option)}
                                            className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${isSelected
                                                    ? 'bg-aura-purple/30 border border-aura-purple/50'
                                                    : 'hover:bg-white/5'
                                                } ${isLocked ? 'opacity-60' : ''}`}
                                        >
                                            {/* Icon */}
                                            <div className={`p-2 rounded-full ${isSelected ? 'bg-aura-purple text-white' : 'bg-white/10 text-gray-400'
                                                }`}>
                                                {option.icon}
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{option.label}</span>
                                                    <span className="text-lg">{option.emoji}</span>
                                                    {option.premium && !isPremium && (
                                                        <Lock className="w-3 h-3 text-yellow-400" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400">{option.description}</div>
                                            </div>

                                            {/* Selected indicator */}
                                            {isSelected && (
                                                <Check className="w-5 h-5 text-aura-cyan" />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Premium CTA */}
                            {!isPremium && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <Button
                                        onClick={handleUpgrade}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90"
                                    >
                                        <Crown className="w-4 h-4 mr-2" />
                                        Upgrade a Premium - €4.99/mes
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default VisibilitySelector;
