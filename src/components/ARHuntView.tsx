import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, RefreshCw, Crosshair, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useInventory } from '@/contexts/InventoryContext';
import { useSound } from '@/contexts/SoundContext';
import { api } from '@/services/api';
import { useWeb3 } from '@/contexts/Web3Context';
import { ethers } from 'ethers';

interface Crystal {
  id: number;
  x: number;
  y: number;
  dist: number;
}

interface ARHuntViewProps {
  onComplete: () => void;
  onBack: () => void;
}

const ARHuntView = ({ onComplete, onBack }: ARHuntViewProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [crystals, setCrystals] = useState<Crystal[]>([]);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [prevLocation, setPrevLocation] = useState<GeolocationPosition | null>(null);

  const { addItem } = useInventory();
  const { playSound } = useSound();
  const { account } = useWeb3();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera error:", err);
        setHasPermission(false);
      }
    };

    const watchLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(
          (pos) => {
            setPrevLocation(location);
            setLocation(pos);
          },
          (err) => console.error("GPS error:", err),
          { enableHighAccuracy: true }
        );
      }
    };

    startCamera();
    watchLocation();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const spawnCrystal = () => {
    const newCrystal: Crystal = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      dist: Math.floor(Math.random() * 50) + 5
    };
    setCrystals(prev => [...prev, newCrystal]);
    playSound('scan');
  };

  const handleCapture = async (crystalId: number) => {
    if (!location) {
      toast.error("Waiting for GPS signal...");
      return;
    }

    try {
      if (!window.ethereum) throw new Error("No wallet found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const message = `Claim reward at ${Date.now()}`;
      const signature = await signer.signMessage(message);

      const result = await api.game.claimReward({
        address: account,
        signature,
        message,
        prevLat: prevLocation?.coords.latitude ?? location.coords.latitude,
        prevLon: prevLocation?.coords.longitude ?? location.coords.longitude,
        prevTime: prevLocation?.timestamp ?? Date.now(),
        currLat: location.coords.latitude,
        currLon: location.coords.longitude,
        currTime: Date.now()
      });

      if (result.success) {
        playSound('collect');
        addItem(result.reward);
        setCrystals(prev => prev.filter(c => c.id !== crystalId));
        toast.success("Crystal collected!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to capture crystal");
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {hasPermission === false ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <p>Camera permission required for AR Hunt</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Card className="bg-black/50 border-aura-cyan/30 backdrop-blur-md p-3 pointer-events-auto">
            <div className="flex items-center gap-2 text-aura-cyan">
              <MapPin className="w-4 h-4" />
              <div className="text-xs font-mono">
                {location ? (
                  <>
                    LAT: {location.coords.latitude.toFixed(4)}<br />
                    LNG: {location.coords.longitude.toFixed(4)}
                  </>
                ) : "Acquiring GPS..."}
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-2 pointer-events-auto">
            <Button size="icon" variant="outline" className="bg-black/50 border-aura-purple/50 text-aura-purple hover:bg-aura-purple/20" onClick={spawnCrystal}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="destructive" className="bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500/40" onClick={onBack}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <Crosshair className="w-12 h-12 text-white/80" />
        </div>

        {/* AR Objects (Crystals) */}
        <AnimatePresence>
          {crystals.map(crystal => (
            <motion.div
              key={crystal.id}
              className="absolute pointer-events-auto"
              style={{ left: `${crystal.x}%`, top: `${crystal.y}%` }}
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <button
                onClick={() => handleCapture(crystal.id)}
                className="group relative flex flex-col items-center"
              >
                {/* Particle Effects */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-aura-cyan rounded-full"
                      animate={{
                        x: [0, (Math.random() - 0.5) * 100],
                        y: [0, (Math.random() - 0.5) * 100],
                        opacity: [1, 0],
                        scale: [1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>

                <div className="w-20 h-20 bg-gradient-to-br from-aura-cyan via-aura-purple to-pink-500 rounded-full blur-md opacity-80 group-hover:opacity-100 transition-opacity animate-pulse shadow-[0_0_30px_rgba(0,255,255,0.5)]" />
                <div className="absolute top-2 w-16 h-16 bg-white/30 rounded-full backdrop-blur-sm border border-white/50 group-hover:scale-110 transition-transform" />

                {/* Floating Label */}
                <motion.span
                  className="mt-2 text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/20"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {crystal.dist}m
                </motion.span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bottom Controls */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-auto">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 bg-white/20 border-2 border-white/50 hover:bg-white/30 backdrop-blur-sm"
            onClick={() => toast.info("Scanning area...")}
          >
            <Camera className="w-8 h-8 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ARHuntView;
