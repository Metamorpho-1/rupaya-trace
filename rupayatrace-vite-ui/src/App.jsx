import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, Globe, Fingerprint, Eye } from "lucide-react";
import { AnonAadhaarProvider } from "@anon-aadhaar/react"; // 1. MOVED IMPORT TO TOP

// Ensure your CSS is imported somewhere in your project (usually main.jsx/index.jsx)
// import "./index.css"; 

import { ImpactReel } from "./components/ImpactReel";
import AgentPortal from "./pages/AgentPortal";
import NgoDashboard from "./pages/NgoDashboard";
import DonateFlow from "./pages/DonateFlow";

// --- LANDING PAGE ---
function LandingPage() {
  const [showContent, setShowContent] = useState(false);

  // Removed the Next.js junk that got pasted here!

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <main className="relative w-full h-screen overflow-hidden bg-black text-white font-inter">
        
        {/* ... (Your existing scanning line and video background code goes here) ... */}

        <div className="relative z-20 flex flex-col justify-between h-full p-8 md:p-20 max-w-screen-2xl mx-auto w-full">
          <header className="flex justify-between items-center w-full">
            <motion.div animate={showContent ? { opacity: 1 } : { opacity: 0 }} className="flex flex-col">
              <span className="font-space font-black text-3xl tracking-tighter">RUPAYATRACE</span>
              <span className="text-[9px] text-zinc-600 tracking-[.5em] uppercase transition-colors group-hover:text-white">Radical Transparency</span>
            </motion.div>
            
            <Link to="/ngo" className="w-10 h-10 border border-zinc-900 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
              <Globe size={14} />
            </Link>
          </header>

          <div className="flex flex-col items-start w-full">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={showContent ? { opacity: 1, x: 0 } : {}}
              className="font-space text-[10rem] md:text-[16rem] leading-[0.75] font-black tracking-tighter uppercase"
            >
              WITNESS <br />
              <span className="text-zinc-800 italic font-light lowercase pr-8">the</span> 
              PROOF.
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 w-full items-end border-t border-zinc-900 pt-16 mt-8">
              <div className="md:col-span-7 space-y-10">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={showContent ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 }}
                  className="text-4xl md:text-6xl font-light leading-none text-zinc-500"
                >
                  Every rupee verified. <br />Every story told.
                </motion.p>
              </div>

              <div className="md:col-span-5 flex justify-end">
                <Link to="/donate">
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: "#fff", color: "#000" }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative bg-transparent border border-zinc-800 text-white px-16 py-10 rounded-none font-space font-black uppercase tracking-[0.2em] text-sm flex items-center gap-6 overflow-hidden transition-colors"
                  >
                    <span className="relative z-10">START THE TRACE</span>
                    <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ImpactReel />
    </>
  );
}

// --- MASTER ROUTER ---
export default function App() {
  return (
    // 2. WRAPPED THE ENTIRE APP IN THE PROVIDER HERE
    <AnonAadhaarProvider _useTestAadhaar={true}>
      <Router>
        <div className="bg-black min-h-screen text-white">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/agent" element={<AgentPortal />} />
            <Route path="/ngo" element={<NgoDashboard />} />
            <Route path="/donate" element={<DonateFlow />} />
          </Routes>
        </div>
      </Router>
    </AnonAadhaarProvider>
  );
}