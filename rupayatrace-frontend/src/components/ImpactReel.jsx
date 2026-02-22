"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sparkles, Activity, CheckCircle2, Heart, ArrowUpRight } from "lucide-react";

// 🟢 HIGH-FIDELITY STORY DATA
const stories = [
  {
    id: "RT-S-001",
    title: "Restoring the Classrooms of Tomorrow.",
    category: "Education",
    ngo: "Cry India",
    location: "Rural Maharashtra",
    coords: "19.7515° N, 75.7139° E",
    impactMetric: "850+ Students Equipped",
    allocation: "₹12.5 Lakhs",
    excerpt: "When the monsoons washed away the local school's infrastructure, 850 children lost their safe space. Through community support, we didn't just replace books—we built flood-resilient digital labs.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "RT-S-002",
    title: "Mid-day Meals, Infinite Potential.",
    category: "Nutrition",
    ngo: "Akshaya Patra",
    location: "Urban Bangalore",
    coords: "12.9716° N, 77.5946° E",
    impactMetric: "5,000 Meals Daily",
    allocation: "₹8.0 Lakhs",
    excerpt: "Hunger should never be a barrier to education. By securing the supply chain for three urban schools, attendance has spiked by 42% in just two months.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "RT-S-003",
    title: "Rebuilding Ground Zero.",
    category: "Disaster Relief",
    ngo: "Goonj",
    location: "Coastal Odisha",
    coords: "20.9517° N, 85.0985° E",
    impactMetric: "120 Families Sheltered",
    allocation: "₹15.2 Lakhs",
    excerpt: "Immediate relief deployed within 48 hours of the cyclone. From temporary shelters to medical kits, the community response was absolute and verified.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "RT-S-004",
    title: "Empowering Rural Healers.",
    category: "Healthcare",
    ngo: "Smile Foundation",
    location: "Remote Assam",
    coords: "20.9204° N, 92.9376° E",
    impactMetric: "3 Mobile Clinics Active",
    allocation: "₹22.0 Lakhs",
    excerpt: "Bringing critical maternal healthcare to villages cut off from the main grid. These mobile nodes have successfully overseen 400+ safe deliveries this quarter.",
    // 🟢 FIXED: Robust medical/care image link added
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1200",
  }
];

export const ImpactReel = () => {
  const [activeStory, setActiveStory] = useState(stories[0].id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto space-y-20 pb-32"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-[#10b981] font-bold text-xs uppercase tracking-widest bg-[#10b981]/10 px-4 py-2 inline-flex rounded-sm">
            <Activity size={14} className="animate-pulse" /> Live Impact Feed
          </div>
          <h2 className="text-6xl font-bold tracking-tighter leading-[0.9] text-white">
            Stories of <br /> True Change.
          </h2>
        </div>
        <p className="text-sm text-[#a1a1aa] font-medium max-w-sm leading-relaxed pb-2 border-l border-[#27272a] pl-6">
          Behind every data point on our ledger is a human life transformed. Explore the verified journeys of your collective kindness.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row h-[700px] w-full gap-4">
        {stories.map((story) => {
          const isActive = activeStory === story.id;
          return (
            <motion.div
              key={story.id}
              layout
              onMouseEnter={() => setActiveStory(story.id)}
              className={`relative overflow-hidden rounded-sm border border-[#27272a] cursor-pointer group transition-colors duration-500 hover:border-[#52525b] ${isActive ? "flex-[4]" : "flex-[1]"}`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="absolute inset-0 z-0 bg-[#050505]">
                <motion.img 
                  src={story.image} 
                  alt={story.title}
                  className={`w-full h-full object-cover transition-all duration-700 ease-out ${isActive ? "grayscale-0 scale-100 opacity-80" : "grayscale scale-110 opacity-30"}`}
                />
                <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? "bg-gradient-to-t from-[#000000] via-[#050505]/60 to-transparent" : "bg-[#050505]/50"}`} />
              </div>

              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
                <div className={`absolute top-8 left-8 transition-all duration-500 ${isActive ? 'rotate-0' : 'lg:-rotate-90 lg:-translate-x-4 lg:translate-y-8 origin-top-left'}`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 ${isActive ? 'bg-white text-black' : 'bg-[#18181b] text-[#a1a1aa] border border-[#27272a]'}`}>
                    {story.category}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div 
                      key="expanded"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="space-y-8 w-full max-w-2xl"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[#10b981] text-[10px] uppercase tracking-[0.3em] font-bold"><CheckCircle2 size={14} /> Verified via {story.ngo}</div>
                        <h3 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">{story.title}</h3>
                        <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-lg">{story.excerpt}</p>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-[#27272a]/80 backdrop-blur-sm">
                        <div className="space-y-1"><p className="text-[9px] uppercase tracking-widest text-[#71717a] font-bold flex items-center gap-2"><MapPin size={10} /> Node</p><p className="text-white font-medium text-sm">{story.location}</p><p className="text-[#52525b] text-[9px] font-mono">{story.coords}</p></div>
                        <div className="space-y-1"><p className="text-[9px] uppercase tracking-widest text-[#71717a] font-bold">Allocation</p><p className="text-white font-medium text-sm">{story.allocation}</p></div>
                        <div className="space-y-1 hidden lg:block"><p className="text-[9px] uppercase tracking-widest text-[#71717a] font-bold text-[#10b981]">Result</p><p className="text-[#10b981] font-bold text-sm">{story.impactMetric}</p></div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="collapsed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hidden lg:flex flex-col items-center absolute bottom-8 left-0 right-0"
                    >
                      <div className="h-12 w-[1px] bg-[#27272a] mb-4" />
                      <Sparkles size={16} className="text-[#52525b]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between p-12 border border-[#27272a] bg-[#09090b] rounded-sm mt-12 gap-8">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-[#18181b] border border-[#27272a] flex items-center justify-center rounded-sm"><Heart size={24} className="text-[#a1a1aa]" /></div>
          <div><h4 className="text-2xl font-bold text-white">Become part of the story.</h4><p className="text-[#71717a] text-sm font-medium mt-1">Navigate to 'Make a Donation' to ignite the next sequence.</p></div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <div className="px-8 py-4 bg-[#18181b] border border-[#27272a] text-[#a1a1aa] font-bold uppercase tracking-[0.2em] text-[10px] rounded-sm flex items-center gap-3"><ArrowUpRight size={14} /> See Header Tabs</div>
        </div>
      </div>
    </motion.div>
  );
};