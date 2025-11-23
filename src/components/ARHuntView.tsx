<p>Camera permission required for AR Hunt</p>
      </div >
    ) : (
  <video
    ref={videoRef}
    autoPlay
    playsInline
              LAT: {location.coords.latitude.toFixed(4)}<br />
              LNG: { location.coords.longitude.toFixed(4) }
            </>
          ) : "Acquiring GPS..."}
        </div >
      </div >
    </Card >

  <div className="flex flex-col gap-2 pointer-events-auto">
    <Button size="icon" variant="outline" className="bg-black/50 border-aura-purple/50 text-aura-purple hover:bg-aura-purple/20" onClick={spawnCrystal}>
      <RefreshCw className="w-4 h-4" />
    </Button>
  </div>
  </div >

  {/* Crosshair */ }
  < div className = "absolute inset-0 flex items-center justify-center opacity-50" >
    <Crosshair className="w-12 h-12 text-white/80" />
  </div >

  {/* AR Objects (Crystals) */ }
{
  crystals.map(crystal => (
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
  ))
}

{/* Bottom Controls */ }
<div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-auto">
  <Button
    size="lg"
    className="rounded-full w-16 h-16 bg-white/20 border-2 border-white/50 hover:bg-white/30 backdrop-blur-sm"
    onClick={() => toast.info("Scanning area...")}
  >
    <Camera className="w-8 h-8 text-white" />
  </Button>
</div>
</div >
  </div >
);
};

export default ARHuntView;
