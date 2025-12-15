/**
 * DonationBanner - A non-intrusive banner encouraging donations.
 * 
 * Shows a small floating button that expands to reveal donation info.
 * Designed to be visible but not annoying to users.
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 1.0.0
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DonationBanner = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    const paypalUrl = "https://paypal.me/ramiballes96";

    return (
        <div className="fixed bottom-20 right-4 z-40">
            <AnimatePresence>
                {isExpanded ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    >
                        <Card className="p-4 w-72 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 backdrop-blur-xl">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                                    <span className="font-bold text-sm">Support Aura World</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setIsDismissed(true)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground mb-3">
                                ¡Ayuda a Manuel a seguir desarrollando Aura World! Cada donación acelera el lanzamiento. 🚀
                            </p>

                            <div className="space-y-2">
                                <a
                                    href={paypalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-opacity"
                                >
                                    <Heart className="w-4 h-4" />
                                    Donar via PayPal
                                    <ExternalLink className="w-3 h-3" />
                                </a>

                                <div className="text-center text-xs text-muted-foreground">
                                    📧 ramiballes96@gmail.com
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 text-xs"
                                onClick={() => setIsExpanded(false)}
                            >
                                Cerrar
                            </Button>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsExpanded(true)}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/30"
                    >
                        <Heart className="w-6 h-6 text-white fill-white" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DonationBanner;
