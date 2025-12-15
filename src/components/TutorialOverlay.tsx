import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Camera, Package, X } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useTranslation } from 'react-i18next';

const TutorialOverlay = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const { isConnected } = useWeb3();

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('aura_tutorial_seen');
        if (!hasSeenTutorial) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('aura_tutorial_seen', 'true');
    };

    if (!isVisible) return null;

    const steps = [
        {
            title: t('tutorial.welcome_title'),
            description: t('tutorial.welcome_desc'),
            icon: <MapPin className="w-12 h-12 text-aura-cyan" />,
        },
        {
            title: t('tutorial.find_title'),
            description: t('tutorial.find_desc'),
            icon: <MapPin className="w-12 h-12 text-aura-purple" />,
        },
        {
            title: t('tutorial.ar_title'),
            description: t('tutorial.ar_desc'),
            icon: <Camera className="w-12 h-12 text-pink-500" />,
        },
        {
            title: t('tutorial.build_title'),
            description: t('tutorial.build_desc'),
            icon: <Package className="w-12 h-12 text-yellow-400" />,
        }
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <Card className="w-full max-w-md bg-gray-900/90 border-aura-cyan/30 text-white p-6 relative overflow-hidden">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-6">
                        <motion.div
                            key={step}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="p-4 rounded-full bg-white/10"
                        >
                            {steps[step].icon}
                        </motion.div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold glow-text">{steps[step].title}</h2>
                            <p className="text-gray-300">{steps[step].description}</p>
                        </div>

                        <div className="flex gap-2 w-full pt-4">
                            <div className="flex-1 flex justify-center gap-1 mt-2">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-aura-cyan' : 'bg-gray-600'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleNext}
                            className="w-full bg-gradient-to-r from-aura-cyan to-aura-purple hover:opacity-90 font-bold"
                        >
                            {step === steps.length - 1 ? t('tutorial.start_hunting') : t('tutorial.next')}
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};

export default TutorialOverlay;
