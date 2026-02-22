import { motion } from "framer-motion";
import { useState } from "react";
import { ShieldCheck, ArrowRight, Smartphone, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function DonateFlow() {
  const [step, setStep] = useState("amount");
  const [amount, setAmount] = useState("");

  return (
    <main className="min-h-screen bg-black text-white font-inter flex flex-col items-center justify-center p-6 relative">
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <Link to="/" className="absolute top-10 left-10 text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-white transition-all">
        ← Cancel
      </Link>

      <div className="w-full max-w-md space-y-12 relative z-10">
        <header className="text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-black" size={24} />
          </motion.div>
          <h1 className="font-space text-4xl font-black uppercase tracking-tighter italic">Initiate <br />Transfer.</h1>
        </header>

        <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl space-y-8">
          {step === "amount" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="space-y-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Select Impact Amount</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-space font-light text-zinc-500">₹</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="bg-transparent border-none text-6xl font-space font-black tracking-tighter text-white focus:outline-none w-48 text-center"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep("payment")}
                disabled={!amount}
                className="w-full py-6 bg-white text-black font-space font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all disabled:opacity-20 cursor-pointer"
              >
                Confirm Amount <ArrowRight size={18} className="inline ml-2" />
              </button>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="p-6 border border-zinc-800 rounded-2xl bg-black space-y-4">
                <div className="flex justify-between items-center">
                  <Smartphone className="text-zinc-600" size={20} />
                  <span className="text-[10px] uppercase font-bold text-zinc-600">UPI Gateway</span>
                </div>
                <input 
                  type="text" 
                  placeholder="vpa@upi"
                  className="w-full bg-transparent border-b border-zinc-800 py-4 font-mono text-xl focus:border-white outline-none transition-all"
                />
              </div>
              <button 
                onClick={() => setStep("success")}
                className="w-full py-6 bg-white text-black font-space font-black uppercase tracking-widest text-sm cursor-pointer"
              >
                Pay & Trace ₹{amount}
              </button>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Lock className="text-black" size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="font-space text-2xl font-black uppercase tracking-tighter">Contribution Locked.</h3>
                <p className="text-xs text-zinc-500 max-w-[240px] mx-auto">Your donation is now in the escrow vault. It will only be released when the field agent uploads GPS-verified proof.</p>
              </div>
              <Link to="/ngo" className="block w-full py-4 border border-zinc-800 text-[10px] uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-all">
                View On Live Map
              </Link>
            </motion.div>
          )}
        </section>

        <footer className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-700 font-bold">
            Secured by Polygon Protocol • 2026
          </p>
        </footer>
      </div>
    </main>
  );
}