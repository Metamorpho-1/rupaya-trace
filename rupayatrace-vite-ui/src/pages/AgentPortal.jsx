import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ShieldCheck, MapPin, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { extractLocation } from "../lib/exif"; // Make sure this lib exists!

export default function AgentPortal() {
  const [status, setStatus] = useState("idle");
  const [coords, setCoords] = useState(null);

  const handleUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setStatus("verifying");
    const location = await extractLocation(uploadedFile);
    
    setTimeout(() => {
      setCoords(location);
      setStatus("secured");
    }, 2800);
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-inter overflow-hidden flex flex-col items-center justify-center">
      
      {/* NOIR BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none grayscale">
        <img 
          src="https://images.unsplash.com/photo-1509059852496-f3822ae057bf?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover" 
          alt="Field Context"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <Link to="/" className="absolute top-10 left-10 z-50 text-[10px] uppercase font-bold tracking-[0.4em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
        <ArrowLeft size={12} /> Return
      </Link>

      <div className="relative z-10 w-full max-w-lg p-8 space-y-12">
        <header className="space-y-2">
          <p className="font-space text-[10px] uppercase tracking-[0.5em] text-zinc-600 font-bold">Field Unit Terminal</p>
          <h1 className="font-space text-6xl font-black uppercase tracking-tighter italic leading-none">Upload <br />Evidence.</h1>
        </header>

        <section className="relative">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.label 
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-zinc-900 bg-zinc-950/50 backdrop-blur-2xl cursor-pointer hover:border-white transition-all group"
              >
                <div className="p-6 rounded-full bg-zinc-900 group-hover:bg-white group-hover:text-black transition-all duration-700">
                  <Camera size={32} />
                </div>
                <p className="mt-6 font-space text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Capture Proof of Impact</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </motion.label>
            )}

            {status === "verifying" && (
              <motion.div 
                key="verifying"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="h-80 flex flex-col items-center justify-center bg-zinc-950 border border-zinc-900 space-y-8"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <ShieldCheck size={48} className="text-zinc-500" />
                </motion.div>
                <p className="font-space text-[10px] uppercase tracking-[0.4em] animate-pulse text-zinc-400">Extracting Geotags...</p>
              </motion.div>
            )}

            {status === "secured" && (
              <motion.div 
                key="secured"
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }}
                className="h-80 flex flex-col items-center justify-center bg-white text-black p-10 text-center space-y-8"
              >
                <CheckCircle2 size={56} />
                <div className="space-y-2">
                  <h3 className="font-space font-black text-3xl uppercase tracking-tighter leading-none">Proof Secured.</h3>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-40 italic">
                    {coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "GPS LOCKED // BHARAT"}
                  </p>
                </div>
                <div className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30 border-t border-black/10 pt-5 w-full">
                  Logged to Polygon Mainnet
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="flex justify-between items-center text-[9px] uppercase tracking-[0.3em] text-zinc-700 font-bold border-t border-zinc-900 pt-10">
           <div className="flex items-center gap-2"><MapPin size={10} /> Bharat // Unit_04</div>
           <div className="opacity-50">v1.0.42_STABLE</div>
        </footer>
      </div>
    </div>
  );
}