import { motion, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";

const STORIES = [
  {
    id: 1,
    title: "The Silent Trust",
    location: "Wayanad, Kerala",
    date: "Feb 2026",
    impact: "Clean water systems verified for 40 families.",
    image: "https://images.unsplash.com/photo-1509059852496-f3822ae057bf?q=80&w=2000&auto=format&fit=crop", 
  },
  {
    id: 2,
    title: "Bharat Rising",
    location: "Rural Bihar",
    date: "Jan 2026",
    impact: "Digital kits delivered to village schools.",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2024&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "First Light",
    location: "Majuli, Assam",
    date: "Dec 2025",
    impact: "Solar grid funds released via proof-of-work.",
    image: "https://images.unsplash.com/photo-1506433189151-6987673fb031?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Mumbai Pulse",
    location: "Dharavi, Mumbai",
    date: "Nov 2025",
    impact: "5,000 meals tracked from kitchen to hand.",
    image: "https://images.unsplash.com/photo-1566733971217-d11cf70128e7?q=80&w=1974&auto=format&fit=crop",
  }
];

export const ImpactReel = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.4]);

  return (
    <section ref={targetRef} className="relative h-[450vh] bg-black">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
          <h2 className="font-space text-[30vw] font-black uppercase">TRUTH</h2>
        </div>

        <div className="absolute top-12 left-8 md:left-20 z-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="font-space text-6xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.8] text-white"
          >
            THE <br /> <span className="text-zinc-700">TRACE.</span>
          </motion.h2>
        </div>

        <motion.div style={{ x }} className="flex gap-[20vw] px-[30vw] h-[75vh] items-center">
          {STORIES.map((story) => (
            <div 
              key={story.id} 
              className="group relative h-full w-[85vw] md:w-[55vw] shrink-0 overflow-hidden bg-zinc-950 border border-zinc-900 grayscale hover:grayscale-0 transition-all duration-700"
            >
              <div className="absolute inset-0 overflow-hidden">
                <motion.img 
                  style={{ scale: imageScale }}
                  src={story.image} 
                  alt={story.title} 
                  className="h-full w-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-700"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 p-10 md:p-16 w-full z-20">
                <div className="space-y-6">
                  <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] font-bold text-zinc-500">
                    <MapPin size={12} /> {story.location}
                  </p>
                  <h3 className="font-space text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">
                    {story.title}
                  </h3>
                  <div className="flex justify-between items-end">
                    <p className="text-zinc-400 text-xl font-light max-w-[400px] leading-tight">
                      {story.impact}
                    </p>
                    <button className="p-8 bg-white text-black rounded-none hover:bg-zinc-200 transition-all group-hover:rotate-45">
                      <ArrowUpRight size={32} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute top-10 right-10 text-[10px] uppercase tracking-widest text-zinc-700 font-bold z-20">
                {story.date}
              </div>
            </div>
          ))}
          
          <div className="h-full w-[40vw] shrink-0 flex items-center justify-center border-l border-zinc-900">
             <p className="font-space text-zinc-800 text-2xl uppercase tracking-[1em] -rotate-90">END OF TRACE</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};