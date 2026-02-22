import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, QrCode, Wallet } from "lucide-react";

export function UpiGateway() {
  const [step, setStep] = useState("select");
  const [amount, setAmount] = useState(101);

  const handleDonate = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
    }, 3500);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-zinc-800 blur-3xl rounded-full opacity-50" />

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-2xl font-space font-bold text-white">Support Kerala Relief</h2>
        <p className="text-zinc-500 text-sm mt-1">100% Transparent Milestone Tracking</p>
      </div>
      
      <div className="relative z-10 min-h-[220px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {step === "select" && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-3 gap-3">
                {[51, 101, 500].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-4 rounded-xl font-space text-lg transition-all ${
                      amount === val 
                        ? 'bg-white text-black font-bold scale-105' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleDonate} 
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-space font-bold text-lg py-5 rounded-xl flex items-center justify-center gap-3 transition-colors cursor-pointer border border-zinc-700 hover:border-white"
              >
                <QrCode className="w-5 h-5" /> Pay via UPI
              </button>
              <p className="text-xs text-center text-zinc-600 flex items-center justify-center gap-2 mt-4 font-inter">
                <Wallet className="w-3 h-3" /> Auto-creates Thirdweb hidden wallet
              </p>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-6 space-y-5 text-center"
            >
              <Loader2 className="w-12 h-12 text-zinc-400 animate-spin" />
              <div>
                <h3 className="text-xl font-space font-bold text-white mb-1">Waiting for UPI...</h3>
                <p className="text-sm text-zinc-500 font-inter">Triggering Smart Contract Escrow Vault</p>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex flex-col items-center justify-center py-2 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              >
                <CheckCircle2 className="w-16 h-16 text-white mb-4" />
              </motion.div>
              <h3 className="text-2xl font-space font-bold text-white">Donation Secured!</h3>
              
              <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 w-full text-left space-y-3 mt-6 font-inter text-sm">
                <p className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Fiat Amount:</span> 
                  <span className="text-white font-mono">₹{amount}</span>
                </p>
                <p className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Crypto Minted:</span> 
                  <span className="text-zinc-300 font-mono">{amount} RUP</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-500">Vault Status:</span> 
                  <span className="text-white font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Locked
                  </span>
                </p>
              </div>

              <button 
                onClick={() => setStep("select")} 
                className="text-zinc-500 hover:text-white text-sm mt-6 underline underline-offset-4 cursor-pointer"
              >
                Run another test
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}