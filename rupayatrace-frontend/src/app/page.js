"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Heart, Globe, SearchCheck, 
  HeartHandshake, Clock, CheckCircle2, ShieldCheck, 
  Activity, Users, FileText, Sun, Megaphone,
  Lock as LockIcon, TrendingUp, Eye, FileDigit, Smartphone, ArrowRight, Camera, ArrowLeft,
  Sparkles, X, QrCode, Loader2, AlertCircle, Fingerprint, Receipt, LogOut // 🟢 Added LogOut Icon
} from "lucide-react";

import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Mock data & components
import AadhaarScanner from "../components/AadhaarScanner"; 
import sampleData from "../data/sample_donations.json";

// 🟢 IDENTITY CONFIGURATION
const GOOGLE_CLIENT_ID = "804691501982-tm8euebskd8qhnncbu44021gat9ccgmq.apps.googleusercontent.com";

const cleanDonorName = (name) => name ? name.replace(/\s\d+$/, '') : "Kindness Anonymous";

const formatIndianImpact = (num) => {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Crores`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakhs`;
  return `₹${num.toLocaleString('en-IN')}`;
};

// 🟢 WARM, HUMAN, EMPATHETIC COPY
const t = {
  en: {
    welcome: "TRANSPARENT GIVING PLATFORM",
    heroQ: "Whose life will you change today?",
    supportBtn: "Donate Directly",
    supportSub: "100% transparent & traceable.",
    ngoBtn: "NGO Partner",
    ngoSub: "Verify deliveries & receive funds.",
    logout: "Sign Out",
    langToggle: "हिन्दी",
    impactScore: "Kindness Score"
  },
  hi: {
    welcome: "पारदर्शी दान मंच",
    heroQ: "आज आप किसका जीवन बदलेंगे?",
    supportBtn: "सीधे दान करें",
    supportSub: "100% पारदर्शी और सुरक्षित।",
    ngoBtn: "NGO पार्टनर",
    ngoSub: "वितरण सत्यापित करें और फंड प्राप्त करें।",
    logout: "लॉग आउट",
    langToggle: "EN",
    impactScore: "दयालुता स्कोर"
  }
};

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RupayaTrace />
    </GoogleOAuthProvider>
  );
}

function RupayaTrace() {
  const [mounted, setMounted] = useState(false);
  const [activePortal, setActivePortal] = useState("admin"); 
  const [showIntro, setShowIntro] = useState(true);
  const [session, setSession] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState("en");

  // Overlays instead of Tabs to prevent visual clashes
  const [activeOverlay, setActiveOverlay] = useState(null); 
  
  const [localDonations, setLocalDonations] = useState([]);
  const [verifyHash, setVerifyHash] = useState("");
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    document.title = "RupayaTrace | Transparent Impact";
  }, []);

  const impactScore = useMemo(() => {
    const deliveredCount = localDonations.filter(d => d.Status === "Delivered").length;
    return 450 + (deliveredCount * 125);
  }, [localDonations]);

  const handleGoogleAuth = async (accessToken, role) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      setSession({ ...data, role });
      setActivePortal(role === 'ngo' ? 'ngo' : 'user');
    } catch (e) {
      alert("Sign-in failed. Please verify connection.");
    }
  };

  const loginFoundation = useGoogleLogin({ onSuccess: (r) => handleGoogleAuth(r.access_token, 'admin') });
  const loginNGO = useGoogleLogin({ onSuccess: (r) => handleGoogleAuth(r.access_token, 'ngo') });

  const stats = useMemo(() => {
    const total = sampleData?.reduce((acc, curr) => acc + (curr.Amount_INR || 0), 0) || 0;
    const localTotal = localDonations.reduce((acc, curr) => acc + curr.Amount_INR, 0);
    const activeSecured = localDonations.filter(d => d.Status === "Secured").length;
    return { 
      total: total + localTotal, 
      count: (sampleData?.length || 0) + localDonations.length,
      secured: activeSecured
    };
  }, [localDonations]);

  const filteredFeed = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const combinedData = [...localDonations, ...(sampleData || [])];
    return combinedData.filter(item => 
      String(item.Donor_ID || "").toLowerCase().includes(q) ||
      String(item.Donor_Name || "").toLowerCase().includes(q) ||
      String(item.NGO_Name || "").toLowerCase().includes(q)
    );
  }, [searchQuery, localDonations]);

  const runTracking = () => {
    if (!verifyHash) return;
    setIsAuditing(true);
    let match = localDonations.find(item => item.Donor_ID === verifyHash || item.Txn_Hash === verifyHash);
    if (!match) {
      const historicMatch = sampleData.find(item => item.Donor_ID === verifyHash || item.Txn_Hash === verifyHash);
      if (historicMatch) match = { ...historicMatch, Status: "Delivered", Timestamp: "Prior to 2026" }; 
    }
    setTimeout(() => {
      setAuditResult(match || "NOT_FOUND");
      setIsAuditing(false);
    }, 1500);
  };

  const handleNewDonation = (amount, campaign) => {
    const newId = `RT-D-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      Donor_ID: newId,
      Donor_Name: session.name,
      NGO_Name: campaign.ngo,
      Campaign: campaign.title,
      Amount_INR: parseInt(amount),
      City: "Pending Verification",
      Txn_Hash: `0x${Math.random().toString(16).substr(2, 40)}`,
      Status: "Secured", 
      Timestamp: new Date().toLocaleString()
    };
    setLocalDonations(prev => [newRecord, ...prev]);
    return newId;
  };

  const downloadPDFReceipt = () => {
    if (!auditResult) return;
    setIsGeneratingPDF(true); 
    setTimeout(async () => {
      try {
        const receiptElement = document.getElementById("receipt-card");
        const canvas = await html2canvas(receiptElement, { scale: 2, useCORS: true, backgroundColor: "#050505" });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const margin = 10;
        const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);
        pdf.save(`RupayaTrace_Transparency_${auditResult.Donor_ID}.pdf`);
      } catch (error) { console.error(error); } finally { setIsGeneratingPDF(false); }
    }, 200);
  };

  if (!mounted) return <div className="bg-black min-h-screen" />;

  // 🟢 COMPREHENSIVE NGO PORTAL TAKEOVER
  if (session && activePortal === "ngo") {
    return <NgoDashboardView onLogout={() => setSession(null)} localDonations={localDonations} setLocalDonations={setLocalDonations} />;
  }

  return (
    <div className="bg-black min-h-screen text-[#F9F9F9] font-sans selection:bg-white selection:text-black antialiased overflow-hidden">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <HumanEmpathyIntro key="intro" onComplete={() => setShowIntro(false)} />
        ) : !session ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-screen bg-black px-10 text-center relative z-10">
             <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="absolute top-10 right-10 px-4 py-2 border border-[#27272a] text-xs font-bold uppercase tracking-widest text-[#71717a] hover:text-white rounded-sm">
               {t[lang].langToggle}
             </button>
             <div className="max-w-2xl w-full space-y-20">
                <div className="space-y-6">
                   <p className="text-[12px] font-bold tracking-[0.4em] text-[#10b981] uppercase flex items-center justify-center gap-3">
                     <Heart size={14} /> {t[lang].welcome}
                   </p>
                   <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white max-w-2xl mx-auto">{t[lang].heroQ}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <button onClick={() => loginFoundation()} className="group p-12 border border-[#27272a] bg-[#09090b] hover:bg-white hover:text-black transition-all text-left space-y-10 rounded-2xl">
                      <HeartHandshake className="opacity-40 group-hover:opacity-100 transition-opacity" size={28} />
                      <div><p className="text-2xl font-bold">{t[lang].supportBtn}</p><p className="text-[10px] uppercase tracking-widest mt-2 opacity-60 font-bold">{t[lang].supportSub}</p></div>
                   </button>
                   <button onClick={() => loginNGO()} className="group p-12 border border-[#27272a] bg-[#09090b] hover:bg-white hover:text-black transition-all text-left space-y-10 rounded-2xl">
                      <Users className="opacity-40 group-hover:opacity-100 transition-opacity" size={28} />
                      <div><p className="text-2xl font-bold">{t[lang].ngoBtn}</p><p className="text-[10px] uppercase tracking-widest mt-2 opacity-60 font-bold">{t[lang].ngoSub}</p></div>
                   </button>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div key="os" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen relative z-10">
            <aside className="w-[100px] border-r border-[#27272a] flex flex-col items-center py-12 justify-between bg-black z-50">
              <div className="flex flex-col items-center space-y-8">
                 <div className="h-12 w-12 overflow-hidden border border-[#52525b] rounded-full p-0.5">
                   <img src={session.picture} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                 </div>
                 <div className="flex flex-col items-center gap-1">
                    <Sun size={16} className="text-[#eab308]" />
                    <span className="text-sm font-black text-white">{impactScore}</span>
                    <span className="text-[7px] uppercase tracking-tighter text-[#71717a] font-bold text-center leading-tight mt-1">{t[lang].impactScore}</span>
                 </div>
              </div>
              <nav className="flex flex-col gap-12">
                <NavBtn id="user" active={activePortal} set={setActivePortal} icon={<Globe size={20} />} label="STORY" />
                <NavBtn id="admin" active={activePortal} set={setActivePortal} icon={<Heart size={20} />} label="IMPACT" />
              </nav>
              <div className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-[#050505] relative">
              <header className="h-24 border-b border-[#27272a] px-12 md:px-20 flex items-center justify-between backdrop-blur-3xl bg-black/40 z-20 relative">
                <div className="flex flex-col">
                  <h1 className="text-sm font-bold tracking-[0.25em] uppercase flex items-center gap-3">RupayaTrace</h1>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#71717a] mt-1 font-bold">Welcome, {session.name}</span>
                </div>
                <div className="flex items-center gap-6">
                   <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="text-[10px] font-bold uppercase tracking-widest text-[#71717a] hover:text-white transition-colors">{t[lang].langToggle}</button>
                   <button onClick={() => setSession(null)} className="px-8 py-3.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#e4e4e7] transition-all rounded-sm">{t[lang].logout}</button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
                  
                  {activePortal === "admin" && (
                    <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 lg:p-28 max-w-7xl mx-auto space-y-32 pb-40">
                       <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="p-6 border border-[#18181b] bg-[#09090b] rounded-2xl flex flex-col justify-between min-h-[160px]">
                            <Activity className="text-[#4ade80]" strokeWidth={1.5} size={24} />
                            <div className="space-y-1">
                               <p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Platform Uptime</p>
                               <p className="text-3xl font-bold text-white tracking-tight">99.9%</p>
                            </div>
                         </div>
                         <div className="p-6 border border-[#18181b] bg-[#09090b] rounded-2xl flex flex-col justify-between min-h-[160px]">
                            <LockIcon className="text-[#eab308]" strokeWidth={1.5} size={24} />
                            <div className="space-y-1">
                               <p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Pending Deliveries</p>
                               <p className="text-3xl font-bold text-white tracking-tight">{stats.secured} Funds</p>
                            </div>
                         </div>
                         <div className="p-6 border border-[#18181b] bg-[#09090b] rounded-2xl flex flex-col justify-between min-h-[160px]">
                            <CheckCircle2 className="text-[#60a5fa]" strokeWidth={1.5} size={24} />
                            <div className="space-y-1">
                               <p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Verified Deliveries</p>
                               <p className="text-3xl font-bold text-white tracking-tight">1,024 Verified</p>
                            </div>
                         </div>
                         <div className="p-6 border border-[#18181b] bg-[#09090b] rounded-2xl flex flex-col justify-between min-h-[160px]">
                            <HeartHandshake className="text-[#c084fc]" strokeWidth={1.5} size={24} />
                            <div className="space-y-1">
                               <p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Platform Fees Covered</p>
                               <p className="text-3xl font-bold text-white tracking-tight">100% Free</p>
                            </div>
                         </div>
                       </section>

                       <section className="space-y-16">
                          <p className="text-[11px] uppercase tracking-[0.8em] text-[#71717a] font-bold flex items-center gap-4"><Sparkles size={14} /> Global Impact Overview</p>
                          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                             <div className="space-y-6">
                                <h2 className="text-[6rem] lg:text-[10rem] font-bold tracking-tighter leading-none text-white">{formatIndianImpact(stats.total)}</h2>
                                <p className="text-[#a1a1aa] text-lg font-medium max-w-lg leading-relaxed">Representing {stats.count.toLocaleString()} transparent acts of kindness, safely delivered across the country.</p>
                             </div>
                             <div className="text-left md:text-right">
                                <p className="text-5xl font-bold text-white tracking-tighter">{stats.count.toLocaleString()}</p>
                                <p className="text-[11px] uppercase tracking-[0.5em] text-[#71717a] font-bold mt-3">Lives Reached</p>
                             </div>
                          </div>
                          <div className="h-[1px] w-full bg-[#27272a]" />
                       </section>

                       <section className="space-y-24">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-[#27272a] pb-16">
                             <h3 className="text-4xl font-bold uppercase text-white tracking-tight">The Ledger of Kindness</h3>
                             <div className="relative w-full md:w-[480px] group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#71717a] group-focus-within:text-white transition-colors" size={18} />
                                <input type="text" placeholder="Search by name or record ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] py-5 pl-16 pr-6 text-sm font-medium focus:border-[#71717a] outline-none transition-all text-white placeholder:text-[#52525b] rounded-xl" />
                             </div>
                          </div>
                          <div className="divide-y divide-[#27272a]">
                             {filteredFeed.slice(0, 15).map((item, i) => (
                               <div key={i} className="group py-12 flex flex-col md:flex-row md:items-center justify-between hover:bg-[#09090b] transition-all px-6 gap-6 rounded-2xl">
                                  <div className="flex items-center gap-10">
                                     <div className="space-y-2">
                                        <p className="text-2xl font-bold tracking-tight text-white">{cleanDonorName(item.Donor_Name)}</p>
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-[#71717a] font-bold">{item.NGO_Name} — {item.Campaign}</p>
                                     </div>
                                  </div>
                                  <div className="text-left md:text-right">
                                     <p className="text-3xl font-bold tracking-tighter text-white">₹{item.Amount_INR?.toLocaleString('en-IN')}</p>
                                     <p className={`text-[10px] uppercase tracking-[0.6em] font-bold mt-2 ${item.Status === "Secured" ? "text-[#eab308]" : "text-[#10b981]"}`}>
                                        {item.Status === "Secured" ? "Pending Delivery" : "Verified Delivery"}
                                     </p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </section>
                    </motion.div>
                  )}

                  {activePortal === "user" && (
                    <div className="w-full h-full relative">
                       {/* 🟢 BASE LAYER: STUNNING HUMAN SHOWREEL */}
                       <div className="p-12 lg:p-20 pb-40 space-y-12">
                         <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16">
                            <div className="flex-1">
                               <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-white">Real people.<br/>Real help.</h2>
                            </div>
                            <div className="w-px h-24 bg-[#27272a] hidden md:block"></div>
                            <div className="flex-1 md:pl-8">
                               <p className="text-[#a1a1aa] text-lg max-w-sm leading-relaxed">
                                  You deserve to know exactly who you are helping. When we bypass the broken system, your kindness reaches their hands immediately.
                               </p>
                            </div>
                         </div>
                         <HumanStoriesReel />
                       </div>

                       {/* 🟢 FLOATING ACTION BAR */}
                       <div className="fixed bottom-12 left-[100px] right-0 flex justify-center z-30 pointer-events-none">
                          <div className="flex gap-4 pointer-events-auto bg-black/60 p-2 rounded-2xl backdrop-blur-xl border border-[#27272a] shadow-2xl">
                            <button onClick={() => setActiveOverlay('donate')} className="px-8 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-zinc-200 transition-all rounded-xl flex items-center gap-3">
                               <HeartHandshake size={16} /> Send Direct Help
                            </button>
                            <button onClick={() => setActiveOverlay('track')} className="px-8 py-5 bg-[#09090b] text-white font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-[#18181b] border border-[#27272a] transition-all rounded-xl flex items-center gap-3">
                               <SearchCheck size={16} /> Track Donation
                            </button>
                          </div>
                       </div>
                    </div>
                  )}
              </div>

              {/* 🟢 OVERLAY LAYER: PREVENTS ALL DOM CLASHES */}
              <AnimatePresence>
                 {activeOverlay === 'donate' && (
                    <SecureTransferModal 
                       onClose={() => setActiveOverlay(null)} 
                       onSuccess={(amt, campaign) => {
                          const newId = handleNewDonation(amt, campaign);
                          setVerifyHash(newId);
                          setActiveOverlay('track');
                       }}
                    />
                 )}

                 {activeOverlay === 'track' && (
                    <motion.div 
                       initial={{ opacity: 0, y: "100%" }} 
                       animate={{ opacity: 1, y: 0 }} 
                       exit={{ opacity: 0, y: "100%" }}
                       transition={{ type: "spring", damping: 25, stiffness: 200 }}
                       className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl overflow-y-auto p-10 md:p-20 flex flex-col"
                    >
                       <button onClick={() => setActiveOverlay(null)} className="absolute top-10 right-10 p-4 bg-[#09090b] border border-[#27272a] rounded-full hover:bg-white hover:text-black transition-all">
                          <X size={20} />
                       </button>

                       <div className="max-w-4xl mx-auto w-full space-y-16 pt-8 mt-10">
                          <div className="space-y-4 text-center">
                             <SearchCheck className="mx-auto text-[#71717a] mb-6" size={40} />
                             <h2 className="text-5xl font-bold tracking-tight">Transparent Impact Trail.</h2>
                             <p className="text-sm text-[#a1a1aa] font-medium max-w-md mx-auto">Enter your Transparency ID to view your verified delivery receipt and impact badge.</p>
                          </div>
                          
                          <div className="flex gap-4 max-w-2xl mx-auto">
                             <input type="text" placeholder="Enter Record ID (e.g. RT-D-...)" value={verifyHash} onChange={(e) => setVerifyHash(e.target.value)} className="flex-1 bg-[#09090b] border border-[#27272a] p-5 text-sm font-mono focus:border-[#71717a] outline-none text-white placeholder:text-[#52525b] rounded-xl" />
                             <button onClick={runTracking} className="px-10 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-[#e4e4e7] transition-all rounded-xl">
                               {isAuditing ? "Searching..." : "Track Donation"}
                             </button>
                          </div>

                          <AnimatePresence>
                            {auditResult && auditResult !== "NOT_FOUND" && !isAuditing && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
                                 <div id="receipt-card" style={{ backgroundColor: "#050505" }} className="relative border border-[#27272a] rounded-2xl overflow-hidden flex flex-col">
                                    <div className="p-12 border-b border-[#27272a] flex flex-col md:flex-row justify-between items-center bg-[#09090b] gap-8">
                                       <div className="space-y-2 text-center md:text-left">
                                         <p className="text-[10px] uppercase tracking-[0.4em] text-[#71717a] font-bold">Record ID: {auditResult.Donor_ID}</p>
                                         <h3 className="text-3xl font-bold text-[#ffffff]">{cleanDonorName(auditResult.Donor_Name)}</h3>
                                       </div>
                                       <div className="relative h-24 w-24 flex items-center justify-center">
                                          {auditResult.Status === "Delivered" ? (
                                            <>
                                              <div className="absolute inset-0 border-2 border-[#10b981]/30 rotate-45 rounded-2xl" />
                                              <div className="absolute inset-0 border-2 border-[#10b981]/30 rotate-12 rounded-2xl" />
                                              <div className="h-14 w-14 bg-[#10b981] flex items-center justify-center rotate-45 shadow-[0_0_20px_#10b981] rounded-lg">
                                                 <Sun size={20} className="text-black -rotate-45" />
                                              </div>
                                            </>
                                          ) : (
                                            <div className="h-16 w-16 border-2 border-dashed border-[#eab308] rounded-full flex items-center justify-center animate-spin-slow">
                                               <LockIcon size={20} className="text-[#eab308]" />
                                            </div>
                                          )}
                                       </div>
                                       <div className="text-center md:text-right space-y-1">
                                         <p className="text-[10px] uppercase tracking-[0.4em] text-[#71717a] font-bold">Allocated to {auditResult.NGO_Name}</p>
                                         <p className="text-3xl font-bold text-[#ffffff]">₹{auditResult.Amount_INR?.toLocaleString('en-IN')}</p>
                                       </div>
                                    </div>
                                    <div className="p-12 border-b border-[#27272a]">
                                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#71717a] mb-8 flex items-center gap-3"><Clock size={14}/> Donation Delivery Timeline</p>
                                      <div className="relative border-l border-[#27272a] ml-4 space-y-12">
                                        <div className="relative pl-10">
                                          <div className="absolute -left-[9px] top-1 h-4 w-4 bg-[#10b981] rounded-full border-4 border-[#050505]" />
                                          <h4 className="text-white font-bold mb-1 text-sm">Donation Received</h4>
                                          <p className="text-[#a1a1aa] text-xs">Your contribution was successfully recorded on our platform.</p>
                                        </div>
                                        <div className="relative pl-10">
                                          <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-[#050505] ${auditResult.Status === "Secured" ? "bg-[#eab308] animate-pulse" : "bg-[#10b981]"}`} />
                                          <h4 className={`font-bold mb-1 text-sm ${auditResult.Status === "Secured" ? "text-[#eab308]" : "text-white"}`}>Funds Safely Secured</h4>
                                          <p className="text-[#a1a1aa] text-xs">Money is held safely until the NGO provides proof of field delivery.</p>
                                        </div>
                                        <div className="relative pl-10">
                                          <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-[#050505] ${auditResult.Status === "Delivered" ? "bg-[#10b981]" : "bg-[#27272a]"}`} />
                                          <h4 className={`font-bold mb-1 text-sm ${auditResult.Status === "Delivered" ? "text-[#10b981]" : "text-[#71717a]"}`}>Delivered & Verified</h4>
                                          <p className="text-[#52525b] text-xs">NGO successfully verified the recipient in the field. Funds disbursed.</p>
                                        </div>
                                      </div>
                                    </div>
                                 </div>
                                 <div className="flex gap-4">
                                    <button onClick={downloadPDFReceipt} disabled={isGeneratingPDF} className="flex-1 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-[#e4e4e7] transition-all disabled:opacity-80">
                                      {isGeneratingPDF ? "Generating Receipt..." : "Download Digital Receipt"}
                                    </button>
                                 </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>

            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavBtn({ id, active, set, icon, label }) {
  return (
    <button onClick={() => set(id)} className={`flex flex-col items-center gap-3 transition-all relative group ${active === id ? 'text-white' : 'text-[#71717a] hover:text-white'}`}>
      {icon}
      <span className="text-[8px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
      {active === id && <motion.div layoutId="navActive" className="absolute -inset-5 border border-[#3f3f46] rounded-full scale-110" />}
    </button>
  );
}

// ======================================================================
// 🟢 EMPATHETIC HUMAN INTRO
// ======================================================================
function HumanEmpathyIntro({ onComplete }) {
  return (
    <motion.div exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8 }} className="fixed inset-0 z-50 bg-black flex flex-col justify-center px-10 md:px-32 selection:bg-[#10b981] selection:text-white">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="max-w-4xl relative z-10 space-y-8">
         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-[#10b981] font-bold text-xs tracking-[0.4em] uppercase flex items-center gap-3">
           <Heart size={14} className="animate-pulse" /> The Problem
         </motion.p>
         
         <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }} className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-white">
           The system is broken. <br/> <span className="text-zinc-600">We're fixing it.</span>
         </motion.h1>
         
         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3, duration: 1 }} className="text-zinc-400 text-lg md:text-2xl font-medium leading-relaxed max-w-2xl">
           Too often, charity is lost in transit. We built RupayaTrace so you can track your donation directly to the hands of the person who needs it. No middlemen. No secrets. Just human connection.
         </motion.p>
         
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.5 }} className="pt-10">
            <button onClick={onComplete} className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-zinc-200 transition-all overflow-hidden rounded-xl">
               <span className="relative z-10 flex items-center gap-3">Start Helping Directly <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
            </button>
         </motion.div>
      </div>
    </motion.div>
  );
}

// ======================================================================
// 🟢 INTIMATE HUMAN SHOWREEL (Using Unsplash for Guaranteed Loading)
// ======================================================================
function HumanStoriesReel() {
  const stories = [
    { 
      name: "Aarav's Family", 
      location: "Odisha Relief Camp", 
      img: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80", 
      desc: "Rebuilding their home after the floods. Thanks to direct giving, they received funds from a kind stranger in under 48 hours to buy immediate supplies."
    },
    { 
      name: "Kavita", 
      location: "Rural Bihar", 
      img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80", 
      desc: "Attending her first digital classroom. Her learning tablet was safely delivered last Tuesday by a local volunteer who verified the handoff."
    },
    { 
      name: "Arjun & Tara", 
      location: "Assam Borders", 
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80", 
      desc: "Received emergency medical rations just in time. The community verified the delivery, ensuring the help reached them without interference."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stories.map((story, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: i * 0.2 }}
          className="group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-white/5 hover:border-white/20 transition-all duration-500"
        >
          <img src={story.img} alt={story.name} className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-in-out" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
          
          <div className="absolute bottom-0 left-0 w-full p-8 space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#10b981]">{story.location}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{story.name}</h3>
            </div>
            
            <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden">
               <p className="text-sm text-zinc-300 leading-relaxed pt-3 border-t border-zinc-700">
                 {story.desc}
               </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ======================================================================
// 🟢 SECURE TRANSFER MODAL (UPI Validation & QR Interface)
// ======================================================================
function SecureTransferModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("campaign");
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [upiError, setUpiError] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const campaigns = [
    { 
      title: "Odisha Flood Relief", 
      ngo: "Goonj",
      img: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=300&q=80"
    },
    { 
      title: "Digital Classrooms", 
      ngo: "Cry India",
      img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=300&q=80"
    },
    { 
      title: "Mid-day Meals", 
      ngo: "Akshaya Patra",
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=300&q=80"
    }
  ];

  // 🟢 UPI Checker Logic
  const handleUpiChange = (e) => {
    const val = e.target.value;
    setUpi(val);
    if (val.length > 0 && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(val)) {
      setUpiError("Invalid UPI format. Please use name@bank");
    } else {
      setUpiError("");
    }
  };

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: "100%" }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl overflow-y-auto p-6 md:p-20 flex flex-col items-center justify-center"
    >
      <button onClick={onClose} className="absolute top-10 right-10 p-4 bg-[#09090b] border border-[#27272a] rounded-full hover:bg-white hover:text-black transition-all">
        <X size={20} />
      </button>

      <div className="w-full max-w-xl mx-auto relative z-10">
        <div className="bg-[#09090b] border border-[#27272a] rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-8 border-b border-[#27272a] bg-[#050505] flex items-center justify-between">
             <div>
               <h2 className="text-2xl font-bold text-white tracking-tight">Make a Donation</h2>
               <p className="text-xs text-[#10b981] font-bold uppercase tracking-widest mt-1">Secured by Smart Contracts</p>
             </div>
             <HeartHandshake size={32} className="text-[#71717a]" />
          </div>

          <div className="p-10 space-y-8">
            {step === "campaign" && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Choose a Mission</label>
                  <div className="grid grid-cols-1 gap-3">
                    {campaigns.map((c, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedCampaign(c)}
                        className={`p-3 border rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${selectedCampaign?.title === c.title ? 'border-[#10b981] bg-[#10b981]/10' : 'border-[#27272a] bg-black hover:border-[#52525b]'}`}
                      >
                        <img src={c.img} className="w-16 h-16 object-cover rounded-xl grayscale opacity-70" alt="" />
                        <div className="flex-1">
                          <p className="text-white font-bold text-lg">{c.title}</p>
                          <p className="text-xs text-[#71717a] font-medium mt-1">Partner: {c.ngo}</p>
                        </div>
                        {selectedCampaign?.title === c.title && <CheckCircle2 size={24} className="text-[#10b981] mr-4" />}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setStep("amount")} disabled={!selectedCampaign} className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-20">
                  Support this Mission
                </button>
              </motion.div>
            )}

            {step === "amount" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="text-center space-y-4 py-8">
                  <p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Enter Donation Amount</p>
                  <div className="flex items-center justify-center gap-2 border-b-2 border-[#27272a] pb-4 max-w-[240px] mx-auto focus-within:border-white transition-colors">
                    <span className="text-4xl text-[#71717a] font-light">₹</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      autoFocus
                      className="bg-transparent border-none text-6xl font-black tracking-tighter text-white focus:outline-none w-full text-center placeholder:text-[#27272a]"
                      value={amount} onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                   {[500, 2500, 10000].map(val => (
                     <button key={val} onClick={() => setAmount(val.toString())} className="py-4 border border-[#27272a] bg-black rounded-xl text-sm font-bold text-[#a1a1aa] hover:border-white hover:text-white transition-all">₹{val}</button>
                   ))}
                </div>
                <button onClick={() => setStep("payment")} disabled={!amount || amount <= 0} className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                  Continue to Payment <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                
                {/* Simulated QR Code Area */}
                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#27272a] rounded-2xl bg-[#050505]">
                   <QrCode size={100} className="text-white opacity-80 mb-4" strokeWidth={1} />
                   <p className="text-xs text-[#a1a1aa] font-medium">Scan to Pay via any UPI App</p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <div className="h-px bg-[#27272a] flex-1"></div>
                  <span className="text-[10px] uppercase font-bold text-[#71717a] tracking-widest">OR</span>
                  <div className="h-px bg-[#27272a] flex-1"></div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Enter your UPI ID</label>
                  <div className="relative">
                    <input 
                      type="text" placeholder="yourname@upi" value={upi} onChange={handleUpiChange}
                      className={`w-full bg-[#050505] border p-5 font-mono text-lg rounded-xl outline-none transition-all placeholder:text-[#3f3f46] text-white ${upiError ? 'border-red-500/50 focus:border-red-500' : 'border-[#27272a] focus:border-white'}`} 
                    />
                    {upiError && <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />}
                  </div>
                  {upiError && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{upiError}</p>}
                </div>
                
                <button onClick={handlePay} disabled={!upi || upiError} className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-30">
                  Send Donation securely
                </button>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 flex flex-col items-center justify-center space-y-8">
                 <Loader2 size={48} className="animate-spin text-[#10b981]" />
                 <div className="space-y-2 text-center">
                   <p className="text-white text-xl font-bold tracking-tight">Processing securely...</p>
                   <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#71717a]">Awaiting your bank's confirmation</p>
                 </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-8">
                <div className="w-24 h-24 bg-[#10b981] rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 className="text-black" size={40} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold tracking-tight text-white">Thank You!</h3>
                  <p className="text-sm text-[#a1a1aa] max-w-[280px] mx-auto leading-relaxed">
                    ₹{amount} has been safely secured. We will notify you the exact moment {selectedCampaign.ngo} verifies the delivery in the field.
                  </p>
                </div>
                <button onClick={() => onSuccess(amount, selectedCampaign)} className="w-full py-5 border border-[#27272a] bg-[#050505] rounded-xl text-xs uppercase font-bold tracking-widest hover:border-white hover:bg-white hover:text-black transition-all mt-8 flex items-center justify-center gap-3">
                  <FileText size={16} /> View Transparency Receipt
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ======================================================================
// 🟢 COMPREHENSIVE NGO DASHBOARD 
// ======================================================================
function NgoDashboardView({ onLogout, localDonations, setLocalDonations }) {
  const [activeTab, setActiveTab] = useState('vault');
  const [selectedDonation, setSelectedDonation] = useState(null);

  const [newTitle, setNewTitle] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [campaigns, setCampaigns] = useState([
    { title: "Odisha Flood Relief", raised: 1.5, goal: 5 },
    { title: "Digital Classrooms", raised: 0.8, goal: 2 }
  ]);

  const pendingDonations = localDonations.filter(d => d.Status === "Secured");
  const completedDonations = localDonations.filter(d => d.Status === "Delivered");

  const handleCreateCampaign = () => {
    if (!newTitle || !newGoal) return;
    setCampaigns([{ title: newTitle, raised: 0, goal: parseFloat(newGoal) }, ...campaigns]);
    setNewTitle(""); setNewGoal("");
  };

  const markAsDelivered = (donorId) => {
    setLocalDonations(prev => prev.map(d => d.Donor_ID === donorId ? { ...d, Status: "Delivered" } : d));
    setSelectedDonation(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden absolute inset-0 z-50">
      <aside className="w-full md:w-72 border-r border-[#27272a] p-8 flex flex-col justify-between z-10 bg-black">
        <div className="space-y-12">
          <div className="space-y-2">
            <h2 className="font-black text-2xl tracking-tighter uppercase">RupayaTrace</h2>
            <p className="text-[9px] uppercase tracking-[0.4em] text-[#71717a] font-bold">NGO Dashboard</p>
          </div>
          <nav className="space-y-3">
             <SidebarBtn icon={<LockIcon size={16}/>} label="Pending Deliveries" active={activeTab==='vault'} onClick={() => {setActiveTab('vault'); setSelectedDonation(null);}} />
             <SidebarBtn icon={<Megaphone size={16}/>} label="Campaign Hub" active={activeTab==='missions'} onClick={() => setActiveTab('missions')} />
             <SidebarBtn icon={<Activity size={16}/>} label="Community Trace Map" active={activeTab==='map'} onClick={() => setActiveTab('map')} />
          </nav>
        </div>

        {/* 🟢 NEW: EXPLICIT NGO LOGOUT BUTTON */}
        <div className="space-y-6 mt-12">
           <div className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] uppercase tracking-widest text-[#71717a] font-bold">Network</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
             </div>
             <p className="text-xs font-mono text-[#a1a1aa]">POLYGON_MAINNET</p>
           </div>
           
           <button onClick={onLogout} className="w-full py-4 bg-[#09090b] border border-[#27272a] text-[#71717a] font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
             <LogOut size={14} /> Sign Out
           </button>
        </div>
      </aside>

      <section className="flex-1 overflow-y-auto p-8 md:p-16 relative bg-[#050505] custom-scrollbar">
        {activeTab === 'vault' && (
          <div className="max-w-4xl mx-auto space-y-12">
            {!selectedDonation ? (
              <>
                <header className="space-y-2 border-b border-[#27272a] pb-8">
                  <h1 className="text-4xl font-bold tracking-tight">Pending Deliveries.</h1>
                  <p className="text-[#a1a1aa] text-sm">Upload proof of delivery from the field to release these secured funds.</p>
                </header>

                {pendingDonations.length === 0 ? (
                  <div className="p-16 border border-[#27272a] bg-[#09090b] text-center rounded-2xl space-y-4">
                    <CheckCircle2 size={40} className="mx-auto text-[#27272a]" />
                    <p className="text-[#71717a] font-bold uppercase tracking-widest text-xs">All Funds Disbursed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingDonations.map(item => (
                      <div key={item.Donor_ID} className="p-6 border border-[#27272a] bg-[#09090b] rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-[#52525b] transition-all">
                        <div className="space-y-1">
                           <p className="text-[#eab308] text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"><LockIcon size={10}/> Secured by Donor</p>
                           <p className="text-xl font-bold text-white">₹{item.Amount_INR.toLocaleString()} for {item.Campaign}</p>
                           <p className="text-[#71717a] font-mono text-xs">ID: {item.Donor_ID}</p>
                        </div>
                        <button onClick={() => setSelectedDonation(item)} className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-zinc-200 transition-all">
                          Verify & Release
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {completedDonations.length > 0 && (
                  <div className="pt-12">
                    <p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold mb-6">Recently Verified & Released</p>
                    <div className="space-y-3 opacity-60">
                      {completedDonations.map(item => (
                        <div key={item.Donor_ID} className="p-4 border border-[#27272a] bg-black rounded-xl flex justify-between items-center">
                          <span className="font-mono text-xs text-[#a1a1aa]">{item.Donor_ID}</span>
                          <span className="text-sm font-bold text-[#10b981]">₹{item.Amount_INR} Released</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="max-w-xl mx-auto">
                 <button onClick={() => setSelectedDonation(null)} className="text-[10px] uppercase font-bold tracking-widest text-[#71717a] hover:text-white transition-all mb-8 flex items-center gap-2">
                   <ArrowLeft size={14} /> Back to Deliveries
                 </button>
                 <AgentProofUpload 
                    donationRecord={selectedDonation} 
                    onSuccess={() => markAsDelivered(selectedDonation.Donor_ID)} 
                 />
              </div>
            )}
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="max-w-4xl mx-auto space-y-12">
             <header className="space-y-2 border-b border-[#27272a] pb-8">
               <h1 className="text-4xl font-bold tracking-tight">Campaign Hub.</h1>
               <p className="text-[#a1a1aa] text-sm">Create and manage your funding goals.</p>
             </header>

             <div className="p-8 border border-[#27272a] bg-[#09090b] rounded-2xl space-y-6">
               <h3 className="text-sm font-bold uppercase tracking-widest text-[#a1a1aa]">Create New Campaign</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input type="text" placeholder="Campaign Name (e.g. Village Well)" value={newTitle} onChange={e=>setNewTitle(e.target.value)} className="bg-black border border-[#27272a] p-4 text-sm text-white outline-none focus:border-[#71717a] rounded-xl" />
                 <input type="number" placeholder="Funding Goal (In Lakhs)" value={newGoal} onChange={e=>setNewGoal(e.target.value)} className="bg-black border border-[#27272a] p-4 text-sm text-white outline-none focus:border-[#71717a] rounded-xl" />
               </div>
               <button onClick={handleCreateCampaign} className="px-6 py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-zinc-200 transition-all">Publish to Platform</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.map((m, i) => (
                  <div key={i} className="p-8 border border-[#27272a] bg-black rounded-2xl space-y-6">
                     <h3 className="text-xl font-bold">{m.title}</h3>
                     <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest"><span className="text-[#10b981]">Raised: ₹{m.raised}L</span><span className="text-[#71717a]">Goal: ₹{m.goal}L</span></div>
                        <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden"><div className="h-full bg-[#10b981]" style={{ width: `${(m.raised/m.goal)*100}%` }} /></div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* 🟢 FIXED MAP: "Community Trace Hub" instead of Hacker Radar */}
        {activeTab === 'map' && (
          <div className="w-full h-full flex flex-col items-center space-y-12">
             <div className="text-center space-y-4 pt-10">
                <h1 className="text-5xl font-bold tracking-tight">Community Trace Hub.</h1>
                <p className="text-[#a1a1aa] max-w-lg mx-auto">Every glowing point represents a verified human connection. No ghost beneficiaries. No lost funds. Just transparent impact across the country.</p>
             </div>
             
             <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center bg-[#09090b] border border-[#27272a] rounded-3xl overflow-hidden shadow-2xl">
                {/* Soft Glowing Background instead of aggressive radar */}
                <div className="absolute inset-0 opacity-30">
                   <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981] rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
                   <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" />
                </div>
                
                {/* Verified Delivery Points */}
                {[
                  { id: 1, title: "Emergency Rations Delivered", area: "Wayanad", x: "20%", y: "70%", val: "₹5,000", desc: "12 families received aid." },
                  { id: 2, title: "Digital Tablets Distributed", area: "Gaya", x: "70%", y: "40%", val: "₹12,400", desc: "45 students equipped." },
                  { id: 3, title: "Flood Relief Supplies", area: "Majuli", x: "85%", y: "60%", val: "₹8,100", desc: "Community shelter restored." }
                ].map((p) => (
                  <motion.div key={p.id} className="absolute group cursor-pointer z-10" style={{ left: p.x, top: p.y }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: p.id * 0.2 }}>
                    
                    {/* The Dot */}
                    <div className="relative flex items-center justify-center">
                       <div className="w-4 h-4 bg-[#10b981] rounded-full shadow-[0_0_15px_#10b981] z-10" />
                       <div className="absolute w-12 h-12 bg-[#10b981]/20 rounded-full animate-ping" />
                    </div>

                    {/* The Info Card */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-xl border border-[#27272a] p-5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none rounded-xl shadow-2xl transform translate-y-4 group-hover:translate-y-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-1 mb-2"><CheckCircle2 size={10}/> Verified in {p.area}</p>
                      <h4 className="font-bold text-white text-lg leading-tight mb-1">{p.title}</h4>
                      <p className="text-xs text-[#a1a1aa] mb-3">{p.desc}</p>
                      <div className="pt-3 border-t border-[#27272a] flex justify-between items-center">
                         <span className="text-[10px] uppercase text-[#52525b] font-bold tracking-widest">Escrow Released</span>
                         <span className="text-sm font-bold text-white">{p.val}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SidebarBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${active ? 'bg-white text-black' : 'text-[#71717a] hover:bg-[#09090b] hover:text-white'}`}>
       {icon} {label}
    </button>
  );
}

// ======================================================================
// 🟢 FIXED: ULTIMATE 3-STEP NGO VERIFICATION PROTOCOL
// ======================================================================
function AgentProofUpload({ donationRecord, onSuccess }) {
  const [step, setStep] = useState("aadhaar"); // aadhaar -> bill -> photo -> success

  return (
    <div className="bg-[#09090b] border border-[#27272a] rounded-3xl p-8 space-y-10 shadow-2xl">
      <div className="text-center space-y-2 border-b border-[#27272a] pb-6">
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#71717a] font-bold">Anti-Fraud Protocol</p>
        <h2 className="text-3xl font-bold tracking-tight text-white">Release Verification.</h2>
        <p className="text-xs text-[#a1a1aa]">Record ID: <span className="font-mono text-white">{donationRecord.Donor_ID}</span></p>
      </div>

      <div className="relative min-h-[250px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Aadhaar Anon Checker */}
          {step === "aadhaar" && (
            <motion.div key="aadhaar" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full space-y-6 text-center">
              <div className="w-16 h-16 bg-[#18181b] border border-[#27272a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <Fingerprint size={32} className="text-[#a1a1aa]" />
              </div>
              <h3 className="text-xl font-bold text-white">Aadhaar Anon-Checker</h3>
              <p className="text-xs text-[#71717a] max-w-sm mx-auto leading-relaxed">Ensure funds reach a real human. Scan the beneficiary's fingerprint. The system cryptographically verifies existence without storing private data.</p>
              <button onClick={() => setStep("aadhaar-scanning")} className="mt-4 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-all">
                Initiate Secure Scan
              </button>
            </motion.div>
          )}

          {step === "aadhaar-scanning" && (
             <motion.div key="aadhaar-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center space-y-6 w-full">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                   <Fingerprint size={48} className="text-[#10b981]" />
                </motion.div>
                <div className="space-y-2 text-center">
                  <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#a1a1aa]">Querying National Identity Database...</p>
                  <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#10b981] animate-pulse">Ghost Beneficiary Check: PASSED</p>
                </div>
                {setTimeout(() => setStep("bill"), 3000) && null}
             </motion.div>
          )}

          {/* STEP 2: Bill / Expense Checker */}
          {step === "bill" && (
            <motion.div key="bill" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full space-y-6 text-center">
              <div className="w-16 h-16 bg-[#18181b] border border-[#27272a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <Receipt size={32} className="text-[#a1a1aa]" />
              </div>
              <h3 className="text-xl font-bold text-white">Expense Verification</h3>
              <p className="text-xs text-[#71717a] max-w-sm mx-auto leading-relaxed">Upload the official supply receipt/bill. Our optical checker will extract the amount to ensure it matches the ₹{donationRecord.Amount_INR} requested.</p>
              
              <label className="mt-4 px-8 py-4 bg-[#050505] border border-[#27272a] text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-[#18181b] transition-all cursor-pointer inline-block">
                Upload Bill Photo
                <input type="file" className="hidden" accept="image/*" onChange={() => setStep("bill-scanning")} />
              </label>
            </motion.div>
          )}

          {step === "bill-scanning" && (
             <motion.div key="bill-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center space-y-6 w-full">
                <Loader2 size={40} className="text-[#3b82f6] animate-spin" />
                <div className="space-y-2 text-center">
                  <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#a1a1aa]">Running Optical Bill Recognition...</p>
                  <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#3b82f6] animate-pulse">Amount Matched: ₹{donationRecord.Amount_INR}</p>
                </div>
                {setTimeout(() => setStep("photo"), 3000) && null}
             </motion.div>
          )}

          {/* STEP 3: Field Geo-Proof */}
          {step === "photo" && (
            <motion.div key="photo" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full space-y-6 text-center">
              <div className="w-16 h-16 bg-[#18181b] border border-[#27272a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <Camera size={32} className="text-[#a1a1aa]" />
              </div>
              <h3 className="text-xl font-bold text-white">Final Geo-Proof</h3>
              <p className="text-xs text-[#71717a] max-w-sm mx-auto leading-relaxed">Capture a live photo of the handoff. We will extract the ZK GPS coordinates to prove the exact location of delivery.</p>
              
              <label className="mt-4 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-all cursor-pointer inline-block">
                Capture Live Handoff
                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={() => setStep("photo-scanning")} />
              </label>
            </motion.div>
          )}

          {step === "photo-scanning" && (
             <motion.div key="photo-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center space-y-6 w-full">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                   <ScanLine size={40} className="text-[#10b981]" />
                </motion.div>
                <div className="space-y-2 text-center">
                  <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#a1a1aa]">Extracting Secure Geotags...</p>
                </div>
                {setTimeout(() => { setStep("secured"); setTimeout(onSuccess, 3000); }, 3000) && null}
             </motion.div>
          )}

          {/* SUCCESS */}
          {step === "secured" && (
            <motion.div key="secured" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center justify-center bg-[#10b981]/10 rounded-2xl border border-[#10b981]/30 p-8 text-center space-y-4">
              <CheckCircle2 size={48} className="text-[#10b981]" />
              <div className="space-y-1">
                <h3 className="font-bold text-2xl tracking-tight text-white">All Protocols Passed.</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#10b981]">Escrow Vault Unlocked</p>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-2">The requested funds have been successfully disbursed to your NGO.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Protocol Progress Bar */}
      <div className="pt-6 border-t border-[#27272a] flex justify-between items-center px-4">
         <div className={`h-1 flex-1 rounded-full ${['aadhaar-scanning', 'bill', 'bill-scanning', 'photo', 'photo-scanning', 'secured'].includes(step) ? 'bg-[#10b981]' : step === 'aadhaar' ? 'bg-white' : 'bg-[#27272a]'}`} />
         <div className="w-2" />
         <div className={`h-1 flex-1 rounded-full ${['bill-scanning', 'photo', 'photo-scanning', 'secured'].includes(step) ? 'bg-[#10b981]' : step === 'bill' ? 'bg-white' : 'bg-[#27272a]'}`} />
         <div className="w-2" />
         <div className={`h-1 flex-1 rounded-full ${['photo-scanning', 'secured'].includes(step) ? 'bg-[#10b981]' : step === 'photo' ? 'bg-white' : 'bg-[#27272a]'}`} />
      </div>
    </div>
  );
}

function ScanLine({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" x2="17" y1="12" y2="12"/>
    </svg>
  );
}