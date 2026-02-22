import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Activity, Eye, FileDigit } from "lucide-react";
import { Link } from "react-router-dom"; // Added so you can route back to Home!

const PULSES = [
  { id: 1, area: "Wayanad", x: "32%", y: "82%", val: "₹5,000" },
  { id: 2, area: "Gaya", x: "62%", y: "42%", val: "₹12,400" },
  { id: 3, area: "Majuli", x: "88%", y: "35%", val: "₹8,100" },
];

export default function NgoDashboard() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter flex flex-col md:flex-row overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 border-r border-zinc-900 p-10 flex flex-col justify-between z-10 bg-black">
        <div className="space-y-12">
          <div className="space-y-2">
            {/* Click the logo to go back to the landing page */}
            <Link to="/">
              <h2 className="font-space font-black text-2xl tracking-tighter uppercase hover:text-zinc-400 transition-colors cursor-pointer">RupayaTrace</h2>
            </Link>
            <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold italic">NGO Terminal // Bharat</p>
          </div>
          <nav className="space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Protocol Status</p>
              <div className="flex items-center gap-4 text-white font-bold cursor-pointer">
                <Activity size={16} /> Live Trace
              </div>
              <div className="flex items-center gap-4 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <TrendingUp size={16} /> Metrics
              </div>
            </div>
          </nav>
        </div>
        <div className="p-5 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Network</span>
             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <p className="text-xs font-mono text-zinc-400">POLYGON_ACTIVE</p>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <section className="flex-1 p-8 md:p-20 relative flex flex-col justify-between">
        <header className="mb-12 flex justify-between items-end relative z-10">
          <div className="space-y-2">
            <h1 className="font-space text-7xl font-black uppercase tracking-tighter italic">Command.</h1>
            <p className="text-zinc-500 uppercase tracking-[0.4em] text-[10px]">Geospatial Evidence • Real-Time</p>
          </div>
          <div className="hidden lg:block text-right">
             <p className="text-4xl font-space font-bold tracking-tighter">₹1,42,800</p>
             <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Total Disbursed</p>
          </div>
        </header>

        {/* INTERACTIVE MAP AREA */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
           {/* Replaced broken image logic with a sleek abstract radar grid */}
           <div className="w-[800px] h-[400px] border border-zinc-800 rounded-full border-dashed animate-[spin_120s_linear_infinite]" />
           <div className="absolute w-[600px] h-[300px] border border-zinc-800 rounded-full border-dashed animate-[spin_90s_linear_infinite_reverse]" />
        </div>

        <div className="relative z-10 w-full flex-1 flex items-center justify-center">
          {PULSES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute group cursor-crosshair"
              style={{ left: p.x, top: p.y }}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]" />
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-white text-black p-5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">{p.area}</p>
                <p className="font-space font-black text-2xl leading-none mb-3">{p.val}</p>
                <div className="pt-3 border-t border-black/10 flex items-center gap-2 text-[8px] font-black uppercase tracking-tighter italic">
                  <ShieldCheck size={10} /> Verified via Aadhaar
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* LIVE ACTIVITY BAR - Fixed Broken Images! */}
        <div className="mt-10 flex gap-6 overflow-x-auto pb-4 relative z-10">
           {[1, 2, 3].map((i) => (
             <div key={i} className="min-w-[300px] p-6 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 flex justify-between items-center group hover:border-white transition-colors">
               <div className="flex items-center gap-4">
                 {/* Replaced the broken <img> with a clean icon block */}
                 <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center rounded-lg text-zinc-500 group-hover:text-white group-hover:bg-zinc-800 transition-all">
                   <FileDigit size={20} />
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Unit_0{i} Verification</p>
                   <p className="text-sm font-space">ZK Proof Generated</p>
                 </div>
               </div>
               <button className="p-3 border border-zinc-800 rounded-full hover:bg-white hover:text-black transition-all">
                 <Eye size={14} />
               </button>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}