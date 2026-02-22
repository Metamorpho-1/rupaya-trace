"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Heart, User, Shield, ArrowUpRight, 
  Sparkles, MapPin, Globe, Plus, SearchCheck, 
  HeartHandshake, QrCode, Mail, Download, PieChart, Loader2,
  Clock, CheckCircle2, ShieldCheck, Activity, Users, FileText, Sun, Megaphone,
  Lock as LockIcon 
} from "lucide-react";

import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import AadhaarScanner from "../components/AadhaarScanner"; 
import Intro from "../components/Intro";
import { ImpactReel } from "../components/ImpactReel"; 
import sampleData from "../data/sample_donations.json";

// 🟢 IDENTITY CONFIGURATION
const GOOGLE_CLIENT_ID = "804691501982-tm8euebskd8qhnncbu44021gat9ccgmq.apps.googleusercontent.com";

const cleanDonorName = (name) => name ? name.replace(/\s\d+$/, '') : "Kindness Anonymous";

const formatIndianImpact = (num) => {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Crores`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakhs`;
  return `₹${num.toLocaleString('en-IN')}`;
};

// 🟢 MULTI-LANGUAGE DICTIONARY (EN/HI)
const t = {
  en: {
    welcome: "Welcome back to RupayaTrace",
    heroQ: "How will you help the world today?",
    supportBtn: "Support a Cause",
    supportSub: "Personal impact & transparency",
    ngoBtn: "Frontline NGO",
    ngoSub: "Verify identity & deliver funds",
    logout: "Sign Out",
    navStory: "STORY", navField: "FIELD", navCommunity: "IMPACT",
    langToggle: "हिन्दी",
    impactScore: "Impact Score"
  },
  hi: {
    welcome: "रुपयाट्रेस में आपकी वापसी",
    heroQ: "आज आप दुनिया की मदद कैसे करेंगे?",
    supportBtn: "एक कारण का समर्थन करें",
    supportSub: "व्यक्तिगत प्रभाव और पारदर्शिता",
    ngoBtn: "अग्रिम पंक्ति का NGO",
    ngoSub: "पहचान सत्यापित करें और फंड दें",
    logout: "लॉग आउट",
    navStory: "कहानियां", navField: "मैदान", navCommunity: "प्रभाव",
    langToggle: "EN",
    impactScore: "प्रभाव स्कोर"
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
  
  // 🟢 LANGUAGE STATE
  const [lang, setLang] = useState("en");

  const [userView, setUserView] = useState("impact"); 
  const [ngoView, setNgoView] = useState("vault"); 

  const [localDonations, setLocalDonations] = useState([]);
  const [donationState, setDonationState] = useState("idle"); 
  const [donationAmount, setDonationAmount] = useState("");
  const [selectedMission, setSelectedMission] = useState("Odisha Flood Relief (Goonj)");
  const [recentDonationId, setRecentDonationId] = useState("");

  const [verifyHash, setVerifyHash] = useState("");
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [emailState, setEmailState] = useState("idle"); 
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [claimingId, setClaimingId] = useState(null);
  const [claimStep, setClaimStep] = useState(0);

  const [ngoMissions, setNgoMissions] = useState([
    { title: 'Odisha Flood Relief', raised: 8.5, goal: 10 },
    { title: 'Digital Classrooms', raised: 1.2, goal: 5 }
  ]);
  const [isProposing, setIsProposing] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState("");
  const [newMissionGoal, setNewMissionGoal] = useState("");

  useEffect(() => { setMounted(true); }, []);

  // 🟢 SOVEREIGN LEGACY: Impact Score Calculation
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
      item.Donor_ID?.toLowerCase().includes(q) ||
      item.Donor_Name?.toLowerCase().includes(q) ||
      item.NGO_Name?.toLowerCase().includes(q)
    );
  }, [searchQuery, localDonations]);

  const handleDonation = () => {
    if (!donationAmount) return;
    setDonationState("processing");
    
    setTimeout(() => {
      const newId = `RT-D-${Math.floor(1000 + Math.random() * 9000)}`;
      const missionParts = selectedMission.split(" (");
      const missionName = missionParts[0];
      const ngoName = missionParts[1]?.replace(")", "") || "Partner NGO";
      
      const newRecord = {
        Donor_ID: newId,
        Donor_Name: session.name,
        NGO_Name: ngoName,
        Campaign: missionName,
        Amount_INR: parseInt(donationAmount),
        City: "Pending Verification",
        Txn_Hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        Status: "Secured", 
        Timestamp: new Date().toLocaleString()
      };

      setLocalDonations(prev => [newRecord, ...prev]);
      setRecentDonationId(newId);
      setVerifyHash(newId); 
      setDonationState("success");
    }, 2000);
  };

  const runTracking = () => {
    if (!verifyHash) return;
    setIsAuditing(true);
    setEmailState("idle");
    
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

  const processZKClaim = (id) => {
    setClaimingId(id);
    setClaimStep(1); 
    setTimeout(() => {
      setClaimStep(2); 
      setTimeout(() => {
        setClaimStep(3); 
        setTimeout(() => {
          setLocalDonations(prev => prev.map(d => d.Donor_ID === id ? { ...d, Status: "Delivered" } : d));
          setClaimingId(null);
          setClaimStep(0);
        }, 1500);
      }, 2000);
    }, 1500);
  };

  const sendEmailReceipt = () => {
    if (!auditResult || !session?.email) return;
    setEmailState("sending");
    setTimeout(() => { setEmailState("sent"); setTimeout(() => setEmailState("idle"), 5000); }, 2000);
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

  const handleDeployMission = () => {
    if(!newMissionTitle || !newMissionGoal) return;
    setNgoMissions([{ title: newMissionTitle, raised: 0, goal: parseFloat(newMissionGoal) }, ...ngoMissions]);
    setIsProposing(false); setNewMissionTitle(""); setNewMissionGoal("");
  };

  if (!mounted) return <div className="bg-black min-h-screen" />;

  return (
    <div className="bg-black min-h-screen text-[#F9F9F9] font-sans selection:bg-white selection:text-black antialiased overflow-hidden">
      
      <AnimatePresence mode="wait">
        {showIntro ? (
          <Intro key="intro" onComplete={() => setShowIntro(false)} />
        ) : !session ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-screen bg-black px-10 text-center relative z-10">
             
             {/* Language Toggle */}
             <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="absolute top-10 right-10 px-4 py-2 border border-[#27272a] text-xs font-bold uppercase tracking-widest text-[#71717a] hover:text-white rounded-sm">
               {t[lang].langToggle}
             </button>

             <div className="max-w-2xl w-full space-y-20">
                <div className="space-y-4">
                   <p className="text-[10px] font-bold tracking-[0.5em] text-[#71717a] uppercase">{t[lang].welcome}</p>
                   <h2 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[1] text-white">{t[lang].heroQ}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <button onClick={() => loginFoundation()} className="group p-12 border border-[#27272a] bg-[#09090b] hover:bg-white hover:text-black transition-all text-left space-y-10 rounded-sm">
                      <Heart className="opacity-40 group-hover:opacity-100 transition-opacity" size={28} />
                      <div><p className="text-2xl font-bold">{t[lang].supportBtn}</p><p className="text-[10px] uppercase tracking-widest mt-2 opacity-60 font-bold">{t[lang].supportSub}</p></div>
                   </button>
                   <button onClick={() => loginNGO()} className="group p-12 border border-[#27272a] bg-[#09090b] hover:bg-white hover:text-black transition-all text-left space-y-10 rounded-sm">
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
                 {/* 🟢 SOVEREIGN LEGACY: Impact Score */}
                 <div className="flex flex-col items-center gap-1">
                    <Sun size={16} className="text-[#eab308]" />
                    <span className="text-sm font-black text-white">{impactScore}</span>
                    <span className="text-[7px] uppercase tracking-tighter text-[#71717a] font-bold text-center leading-tight mt-1">{t[lang].impactScore}</span>
                 </div>
              </div>

              <nav className="flex flex-col gap-12">
                <NavBtn id="user" active={activePortal} set={setActivePortal} icon={<Globe size={20} />} label={t[lang].navStory} />
                <NavBtn id="ngo" active={activePortal} set={setActivePortal} icon={<MapPin size={20} />} label={t[lang].navField} />
                <NavBtn id="admin" active={activePortal} set={setActivePortal} icon={<Heart size={20} />} label={t[lang].navCommunity} />
              </nav>
              <div className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-[#050505]">
              <header className="h-24 border-b border-[#27272a] px-12 md:px-20 flex items-center justify-between backdrop-blur-3xl bg-black/40">
                <div className="flex flex-col">
                  <h1 className="text-sm font-bold tracking-[0.25em] uppercase flex items-center gap-3">
                    RupayaTrace {activePortal === "ngo" && <span className="bg-[#10b981] text-black px-2 py-0.5 rounded-sm text-[8px] font-black">NGO Portal</span>}
                  </h1>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#71717a] mt-1 font-bold">Profile: {session.name}</span>
                </div>
                <div className="flex items-center gap-6">
                   <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="text-[10px] font-bold uppercase tracking-widest text-[#71717a] hover:text-white transition-colors">{t[lang].langToggle}</button>
                   <button onClick={() => setSession(null)} className="px-8 py-3.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#e4e4e7] transition-all rounded-sm">{t[lang].logout}</button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-12 lg:p-28 custom-scrollbar relative">
                <AnimatePresence mode="wait">
                  
                  {activePortal === "admin" && (
                    <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-32 pb-40">
                       <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                         <div className="p-8 border border-[#27272a] bg-[#09090b] rounded-sm space-y-4">
                            <Activity className="text-[#10b981]" size={20} />
                            <div><p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Platform Uptime</p><p className="text-2xl font-bold text-white">99.9%</p></div>
                         </div>
                         <div className="p-8 border border-[#27272a] bg-[#09090b] rounded-sm space-y-4">
                            <LockIcon className="text-[#eab308]" size={20} />
                            <div><p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Pending Deliveries</p><p className="text-2xl font-bold text-white">{stats.secured} Funds</p></div>
                         </div>
                         <div className="p-8 border border-[#27272a] bg-[#09090b] rounded-sm space-y-4">
                            <CheckCircle2 className="text-[#3b82f6]" size={20} />
                            <div><p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Verified Deliveries</p><p className="text-2xl font-bold text-white">1,024 Verified</p></div>
                         </div>
                         <div className="p-8 border border-[#27272a] bg-[#09090b] rounded-sm space-y-4">
                            <HeartHandshake className="text-[#a855f7]" size={20} />
                            <div><p className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Platform Fees Covered</p><p className="text-2xl font-bold text-white">100% Free</p></div>
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
                                <input type="text" placeholder="Search by name or record ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#09090b] border border-[#27272a] py-5 pl-16 pr-6 text-sm font-medium focus:border-[#71717a] outline-none transition-all text-white placeholder:text-[#52525b] rounded-sm" />
                             </div>
                          </div>
                          <div className="divide-y divide-[#27272a]">
                             {filteredFeed.slice(0, 15).map((item, i) => (
                               <div key={i} className="group py-12 flex flex-col md:flex-row md:items-center justify-between hover:bg-[#09090b] transition-all px-6 gap-6">
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
                    <motion.div key="user" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto flex flex-col h-full">
                       <div className="flex items-center gap-8 md:gap-12 border-b border-[#27272a] pb-8 mb-16 overflow-x-auto whitespace-nowrap">
                          <button onClick={() => setUserView('impact')} className={`text-[10px] font-bold uppercase tracking-[0.3em] pb-2 border-b-2 transition-all ${userView === 'impact' ? 'text-white border-white' : 'text-[#71717a] border-transparent hover:text-white'}`}>Stories of Change</button>
                          <button onClick={() => setUserView('donate')} className={`text-[10px] font-bold uppercase tracking-[0.3em] pb-2 border-b-2 transition-all ${userView === 'donate' ? 'text-white border-white' : 'text-[#71717a] border-transparent hover:text-white'}`}>Make a Donation</button>
                          <button onClick={() => setUserView('track')} className={`text-[10px] font-bold uppercase tracking-[0.3em] pb-2 border-b-2 transition-all ${userView === 'track' ? 'text-white border-white' : 'text-[#71717a] border-transparent hover:text-white'}`}>Track Transparency</button>
                       </div>

                       {userView === 'impact' && <ImpactReel />}
                       
                       {userView === 'donate' && (
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto w-full space-y-16">
                            <AnimatePresence mode="wait">
                              {donationState === "idle" && (
                                <motion.div key="form" exit={{ opacity: 0, y: -20 }} className="space-y-16">
                                  <div className="space-y-4 text-center">
                                     <HeartHandshake className="mx-auto text-[#71717a] mb-6" size={40} />
                                     <h2 className="text-5xl font-bold tracking-tight">Support a Life.</h2>
                                     <p className="text-sm text-[#a1a1aa] font-medium max-w-sm mx-auto">Your contribution is safely held by the platform until the NGO scans a verified recipient.</p>
                                  </div>
                                  <div className="space-y-8 bg-[#09090b] p-10 border border-[#27272a] rounded-sm">
                                     <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#a1a1aa]">Choose a Campaign</label>
                                        <select value={selectedMission} onChange={(e)=>setSelectedMission(e.target.value)} className="w-full bg-[#050505] border border-[#3f3f46] p-5 text-sm font-medium focus:border-[#a1a1aa] outline-none text-white appearance-none cursor-pointer rounded-sm">
                                           <option>Odisha Flood Relief (Goonj)</option>
                                           <option>Digital Classrooms (Cry India)</option>
                                           <option>Mid-day Meal Program (Akshaya Patra)</option>
                                        </select>
                                     </div>
                                     <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#a1a1aa]">Contribution Amount (INR)</label>
                                        <div className="relative">
                                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-[#71717a]">₹</span>
                                          <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="5000" className="w-full bg-[#050505] border border-[#3f3f46] py-5 pl-14 pr-6 text-xl font-bold focus:border-[#a1a1aa] outline-none text-white placeholder:text-[#52525b] rounded-sm" />
                                        </div>
                                     </div>
                                     <button onClick={handleDonation} className="w-full py-6 bg-white text-black font-bold uppercase tracking-[0.3em] text-[11px] hover:bg-[#e4e4e7] transition-all rounded-sm mt-4">
                                       Secure Your Donation
                                     </button>
                                  </div>
                                </motion.div>
                              )}
                              {donationState === "processing" && (
                                <motion.div key="processing" className="flex flex-col items-center justify-center py-32 space-y-8">
                                   <Loader2 size={32} className="animate-spin text-white" />
                                   <p className="text-xs uppercase tracking-[0.4em] font-bold text-[#a1a1aa]">Securing your contribution...</p>
                                </motion.div>
                              )}
                              {donationState === "success" && (
                                <motion.div key="success" className="text-center py-20 space-y-8 bg-[#09090b] border border-[#27272a] rounded-sm p-12">
                                   <LockIcon className="mx-auto text-[#eab308]" size={64} />
                                   <div className="space-y-4">
                                     <h3 className="text-4xl font-bold">Funds Safely Secured.</h3>
                                     <p className="text-[#a1a1aa] leading-relaxed max-w-sm mx-auto">Your donation is held safely. It will only be released to the NGO when they verify delivery.</p>
                                   </div>
                                   <div className="pt-8">
                                     <p className="text-[10px] uppercase tracking-widest text-[#71717a] mb-3">Your Transparency ID</p>
                                     <p className="font-mono text-white text-lg bg-[#050505] py-4 px-8 inline-block border border-[#3f3f46] rounded-sm">{recentDonationId}</p>
                                   </div>
                                   <div className="flex justify-center mt-8">
                                      <button onClick={() => setUserView('track')} className="text-[10px] uppercase tracking-widest text-white border-b border-white pb-1 hover:text-[#a1a1aa] transition-colors">Track Delivery Status</button>
                                   </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                         </motion.div>
                       )}

                       {userView === 'track' && (
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto w-full space-y-16 pt-8">
                            <div className="space-y-4 text-center">
                               <SearchCheck className="mx-auto text-[#71717a] mb-6" size={40} />
                               <h2 className="text-5xl font-bold tracking-tight">Transparent Impact Trail.</h2>
                               <p className="text-sm text-[#a1a1aa] font-medium max-w-md mx-auto">Enter your Transparency ID to view your verified delivery receipt and impact badge.</p>
                            </div>
                            
                            <div className="flex gap-4 max-w-2xl mx-auto">
                               <input type="text" placeholder="Enter Record ID..." value={verifyHash} onChange={(e) => setVerifyHash(e.target.value)} className="flex-1 bg-[#09090b] border border-[#27272a] p-5 text-sm font-mono focus:border-[#71717a] outline-none text-white placeholder:text-[#52525b] rounded-sm" />
                               <button onClick={runTracking} className="px-10 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-[#e4e4e7] transition-all rounded-sm">
                                 {isAuditing ? "Searching..." : "Track Donation"}
                               </button>
                            </div>

                            <AnimatePresence>
                              {auditResult && auditResult !== "NOT_FOUND" && !isAuditing && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                   <div id="receipt-card" style={{ backgroundColor: "#050505" }} className="relative border border-[#27272a] rounded-sm overflow-hidden flex flex-col">
                                      
                                      <div className="p-12 border-b border-[#27272a] flex flex-col md:flex-row justify-between items-center bg-[#09090b] gap-8">
                                         <div className="space-y-2 text-center md:text-left">
                                           <p className="text-[10px] uppercase tracking-[0.4em] text-[#71717a] font-bold">Record ID: {auditResult.Donor_ID}</p>
                                           <h3 className="text-3xl font-bold text-[#ffffff]">{cleanDonorName(auditResult.Donor_Name)}</h3>
                                         </div>
                                         
                                         {/* 🟢 NEW: GENERATIVE IMPACT BADGE (CSS Only, No generic icons) */}
                                         <div className="relative h-24 w-24 flex items-center justify-center">
                                            {auditResult.Status === "Delivered" ? (
                                              <>
                                                {/* Abstract Geometric Badge representing a "Sovereign Legacy" */}
                                                <div className="absolute inset-0 border-2 border-[#10b981]/30 rotate-45 rounded-sm" />
                                                <div className="absolute inset-0 border-2 border-[#10b981]/30 rotate-12 rounded-sm" />
                                                <div className="h-14 w-14 bg-[#10b981] flex items-center justify-center rotate-45 shadow-[0_0_20px_#10b981]">
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
                                           <p className="text-3xl font-bold text-[#ffffff]">₹{auditResult.Amount_INR.toLocaleString('en-IN')}</p>
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

                                      <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                                         <div className="space-y-2"><p className="text-[9px] uppercase tracking-widest text-[#71717a] font-bold">Timestamp</p><p className="text-[#ffffff] text-sm font-mono">{auditResult.Timestamp || 'Verified'}</p></div>
                                         <div className="space-y-2"><p className="text-[9px] uppercase tracking-widest text-[#71717a] font-bold">Verification Status</p><p className="text-[#ffffff] text-sm">{auditResult.Status === "Delivered" ? "100% Verified" : "Pending Field Check"}</p></div>
                                         <div className="space-y-2"><p className="text-[9px] uppercase tracking-widest text-[#71717a] font-bold">Public Record</p><p className="text-[#52525b] text-xs font-mono truncate">{auditResult.Txn_Hash}</p></div>
                                      </div>
                                   </div>

                                   <div className="flex gap-4">
                                      <button onClick={downloadPDFReceipt} disabled={isGeneratingPDF} className="flex-1 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-sm hover:bg-[#e4e4e7] transition-all disabled:opacity-80">
                                        {isGeneratingPDF ? "Generating Receipt..." : "Download Digital Receipt"}
                                      </button>
                                   </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                         </motion.div>
                       )}
                    </motion.div>
                  )}

                  {activePortal === "ngo" && (
                    <motion.div key="ngo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto flex flex-col h-full">
                       <div className="flex items-center gap-12 border-b border-[#27272a] pb-8 mb-16">
                          <button onClick={() => setNgoView('vault')} className={`text-[11px] font-bold uppercase tracking-[0.4em] pb-2 border-b-2 transition-all ${ngoView === 'vault' ? 'text-white border-white' : 'text-[#71717a] border-transparent hover:text-white'}`}>Pending Deliveries</button>
                          <button onClick={() => setNgoView('field')} className={`text-[11px] font-bold uppercase tracking-[0.4em] pb-2 border-b-2 transition-all ${ngoView === 'field' ? 'text-white border-white' : 'text-[#71717a] border-transparent hover:text-white'}`}>Field Verification</button>
                          <button onClick={() => setNgoView('missions')} className={`text-[11px] font-bold uppercase tracking-[0.4em] pb-2 border-b-2 transition-all ${ngoView === 'missions' ? 'text-white border-white' : 'text-[#71717a] border-transparent hover:text-white'}`}>Campaign Hub</button>
                       </div>
                       
                       {ngoView === 'vault' && (
                         <div className="space-y-16">
                            <div className="flex justify-between items-end">
                               <div className="space-y-3">
                                  <LockIcon className="text-[#eab308] mb-6" size={28} />
                                  <h2 className="text-5xl font-bold tracking-tight">Secured Funds.</h2>
                                  <p className="text-sm text-[#a1a1aa] font-medium max-w-lg">These funds are secured by the platform. Submit verification from the field to deliver them to your mission.</p>
                               </div>
                            </div>

                            {localDonations.filter(d => d.Status === "Secured").length === 0 ? (
                               <div className="p-20 border border-[#27272a] bg-[#09090b] text-center rounded-sm">
                                 <ShieldCheck size={48} className="mx-auto text-[#27272a] mb-6" />
                                 <p className="text-[#71717a] font-bold uppercase tracking-widest text-xs">All Funds Successfully Delivered</p>
                               </div>
                            ) : (
                               <div className="grid grid-cols-1 gap-6">
                                  {localDonations.filter(d => d.Status === "Secured").map((item) => (
                                    <div key={item.Donor_ID} className="p-8 border border-[#eab308]/20 bg-[#eab308]/5 rounded-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                       <div className="space-y-2 text-center md:text-left">
                                          <p className="text-[#eab308] text-[9px] font-bold uppercase tracking-widest">Awaiting Verification</p>
                                          <p className="text-2xl font-bold text-white">₹{item.Amount_INR.toLocaleString()} for {item.Campaign}</p>
                                          <p className="text-[#71717a] font-mono text-xs">{item.Donor_ID}</p>
                                       </div>
                                       
                                       <div className="w-full md:w-auto">
                                          {claimingId === item.Donor_ID ? (
                                             <div className="bg-black border border-[#27272a] p-5 rounded-sm space-y-3 min-w-[280px]">
                                                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                                                  <span className={claimStep >= 1 ? "text-white" : "text-[#52525b]"}>Verifying</span>
                                                  <span className={claimStep >= 2 ? "text-[#3b82f6]" : "text-[#52525b]"}>Matching</span>
                                                  <span className={claimStep >= 3 ? "text-[#10b981]" : "text-[#52525b]"}>Delivered!</span>
                                                </div>
                                                <div className="h-1 w-full bg-[#18181b] overflow-hidden rounded-full">
                                                   <motion.div 
                                                     initial={{ width: "0%" }}
                                                     animate={{ width: claimStep === 1 ? "33%" : claimStep === 2 ? "66%" : "100%" }}
                                                     className={`h-full ${claimStep === 3 ? "bg-[#10b981]" : "bg-white"}`}
                                                   />
                                                </div>
                                             </div>
                                          ) : (
                                             <button onClick={() => processZKClaim(item.Donor_ID)} className="w-full md:w-auto px-8 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-sm hover:bg-[#e4e4e7] transition-all">
                                                Verify & Deliver Funds
                                             </button>
                                          )}
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            )}
                         </div>
                       )}

                       {ngoView === 'field' && (
                         <div className="max-w-4xl mx-auto w-full py-10 space-y-12">
                            <div className="text-center space-y-4">
                               <CheckCircle2 size={48} className="mx-auto text-[#10b981]" />
                               <h2 className="text-4xl font-bold text-white tracking-tight">Identity Verification.</h2>
                               <p className="text-[#a1a1aa] text-sm max-w-md mx-auto">Securely verify the recipient to release pending donations. This creates a public proof of delivery.</p>
                            </div>
                            <AadhaarScanner />
                         </div>
                       )}

                       {ngoView === 'missions' && (
                         <div className="space-y-16">
                            <div className="flex justify-between items-end">
                               <div className="space-y-3">
                                  <Megaphone size={28} className="text-[#71717a]" />
                                  <h2 className="text-5xl font-bold tracking-tight">Campaign Hub.</h2>
                               </div>
                               <button onClick={() => setIsProposing(!isProposing)} className="px-8 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-sm flex items-center gap-3">
                                  {isProposing ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Publish Campaign</>}
                               </button>
                            </div>

                            <AnimatePresence>
                              {isProposing && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                  <div className="bg-[#09090b] border border-[#27272a] p-10 rounded-sm space-y-6 mb-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-widest text-[#a1a1aa] font-bold">Campaign Name</label>
                                        <input type="text" value={newMissionTitle} onChange={(e) => setNewMissionTitle(e.target.value)} placeholder="e.g. Village Water Well..." className="w-full bg-[#050505] border border-[#27272a] p-4 text-sm text-white outline-none focus:border-[#71717a]" />
                                      </div>
                                      <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-widest text-[#a1a1aa] font-bold">Goal (In Lakhs)</label>
                                        <input type="number" value={newMissionGoal} onChange={(e) => setNewMissionGoal(e.target.value)} placeholder="e.g. 2.5" className="w-full bg-[#050505] border border-[#27272a] p-4 text-sm text-white outline-none focus:border-[#71717a]" />
                                      </div>
                                    </div>
                                    <button onClick={handleDeployMission} className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.3em] text-[10px] rounded-sm hover:bg-[#e4e4e7]">Publish to Platform</button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {ngoMissions.map((m, i) => (
                                 <div key={i} className="p-10 border border-[#27272a] bg-[#09090b] rounded-sm space-y-8">
                                    <h3 className="text-2xl font-bold">{m.title}</h3>
                                    <div className="space-y-4">
                                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest"><span className="text-[#a1a1aa]">Raised: ₹{m.raised}L</span><span className="text-white">Goal: ₹{m.goal}L</span></div>
                                       <div className="h-1 w-full bg-[#27272a] overflow-hidden"><div className="h-full bg-white" style={{ width: `${(m.raised/m.goal)*100}%` }} /></div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
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