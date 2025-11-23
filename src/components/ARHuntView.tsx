import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crosshair, MapPin, Camera, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { logError } from '@/utils/logger';

const ARHuntView = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [crystals, setCrystals] = useState<{ id: number, x: number, y: number, dist: number }[]>([]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        logError("ARHunt:Camera", err);
        setHasPermission(false);
        toast.error("Camera permission denied. AR features disabled.");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation(pos);
        // Simulate finding crystals based on location changes
        // In a real app, this would query a backend with lat/long
        if (Math.random() > 0.7) {
          spawnCrystal();
        }
      },
      (err) => logError("ARHunt:GPS", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const spawnCrystal = () => {
    const newCrystal = {
      id: Date.now(),
      x: Math.random() * 80 + 10, // 10-90% screen width
      y: Math.random() * 60 + 20, // 20-80% screen height
      dist: Math.floor(Math.random() * 50) + 5 // 5-55m away
    };
    setCrystals(prev => [...prev.slice(-2), newCrystal]); // Keep max 3
  };

  const handleCapture = (id: number) => {
    toast.success(`Crystal #${id} Captured! +50 AURA`);
    setCrystals(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Camera Feed */}
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
          </div>
        </div>

        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <Crosshair className="w-12 h-12 text-white/80" />
        </div>

        {/* AR Objects (Crystals) */}
        {crystals.map(crystal => (
          <div
            key={crystal.id}
            className="absolute pointer-events-auto animate-bounce"
            style={{ left: `${crystal.x}%`, top: `${crystal.y}%` }}
          >
            <button
              onClick={() => handleCapture(crystal.id)}
              className="group relative flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-aura-cyan to-aura-purple rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
              <div className="absolute top-0 w-12 h-12 bg-white rounded-full opacity-20 group-hover:scale-110 transition-transform" />
              <span className="mt-2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                {crystal.dist}m
              </span>
            </button>
          </div>
        ))}

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
