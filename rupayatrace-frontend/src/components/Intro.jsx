"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const line1 = "In the heart of Majuli, a solar grid flickers to life.";
const line2 = "In Wayanad, a family drinks clean water, verified by truth.";
const line3 = "This isn't just data. This is dignity, traced in real-time.";

export default function Intro({ onComplete }) {
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { underline: 0, staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className="max-w-3xl space-y-8">
        {[line1, line2, line3].map((line, idx) => (
          <motion.h1
            key={idx}
            variants={container}
            initial="hidden"
            animate="visible"
            custom={idx * 20}
            className="text-2xl md:text-4xl font-space font-light tracking-tight text-zinc-400 leading-tight"
          >
            {line.split("").map((char, index) => (
              <motion.span key={index} variants={child}>
                {char}
              </motion.span>
            ))}
          </motion.h1>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
          className="pt-12"
        >
          <button
            onClick={onComplete}
            className="group relative px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:bg-white hover:text-black"
          >
            <span className="relative z-10">Witness the Trace</span>
            <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
      
      {/* Subtle background pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />
    </motion.div>
  );
}