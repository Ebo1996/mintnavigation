import { useState, useEffect, useRef } from "react";
import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import Layout from "../components/layout/Layout";
import { sectorService } from "../services/sectorService";
import { departmentService } from "../services/departmentService";
import { getSectorImage } from "../data/imageMap";
import { useT } from "../hooks/useT";
import { useLanguage } from "../hooks/useLanguage";
import {
  FiMapPin, FiStar, FiArrowRight, FiGrid, FiBell,
  FiChevronRight, FiX, FiMessageSquare, FiNavigation,
  FiInfo, FiUsers, FiUser, FiLayers, FiPhone, FiMail, FiGlobe,
  FiChevronLeft, FiSearch,
} from "react-icons/fi";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

/* ── Design tokens ── */
const T = {
  navy:      "#007687",
  navyDark:  "#005e6e",
  navyMid:   "#006d7d",
  navyLight: "#008fa2",
  gold:      "#C8961E",
  goldLight: "#E8B84B",
  surface:   "#F0F7F6",
  card:      "#FFFFFF",
  border:    "#C8E6E4",
  text:      "#0d3533",
  textSub:   "#3a5f5d",
  textMuted: "#6a9c99",
};

/* ── Announcement type icon helper ── */
const typeIcon = (type) =>
  ({ info:"INFO", warning:"WARN", urgent:"URGENT", event:"EVENT", maintenance:"MAINT" })[type] ?? "NOTICE";

import hero1 from "../images/hero1.jpg";
import hero2 from "../images/hero2.jpg";
import hero3 from "../images/hero3.jpg";
import hero4 from "../images/hero4.jpg";
import hero5 from "../images/hero5.jpg";
import defaultManagerImg from "../profile image/abebe.jfif";

/* ── 5 cinematic hero slides ── */
const HERO_SLIDES = [
  { bg: hero1, slideKey: "nav"      },
  { bg: hero2, slideKey: "sectors"  },
  { bg: hero3, slideKey: "feedback" },
  { bg: hero4, slideKey: "about"    },
  { bg: hero5, slideKey: "bel3"     },
];
const SLIDE_MS = 5000;

/* ── Announcement priority colours ── */
const priorityStyle = (p) =>
  ({ urgent:{ bg:"#FEF3C7", color:"#78350F", border:"#F59E0B" }, high:{ bg:"#FEF9EE", color:"#92400E", border:"#FCD34D" }, medium:{ bg:"#FFF8E6", color:"#6B4400", border:"#F0C040" } })[p]
  ?? { bg:"#FFF8E6", color:"#6B4400", border:"#F0C040" };

/* ── Animated counter hook ── */
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); };
  }, [target, duration]);
  return [count, ref];
}

/* ── Stat counter item ── */
const StatItem = ({ value, suffix = "+", label }) => {
  const [count, ref] = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2" style={{ color: T.goldLight }}>
        {count}{suffix}
      </div>
      <div className="text-xs sm:text-sm font-semibold uppercase" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.10em" }}>
        {label}
      </div>
    </div>
  );
};



const Home = () => {
  const [announcements,  setAnnouncements]  = useState([]);
  const [showAnnounce,   setShowAnnounce]   = useState(true);
  const [sectors,        setSectors]        = useState([]);
  const [departments,    setDepartments]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [stats,          setStats]          = useState({ totalDepts: 0, totalSectors: 0, avgRating: 0 });
  const [slideIndex,     setSlideIndex]     = useState(0);
  const [deskPage,       setDeskPage]       = useState(0);
  const [deskSearch,     setDeskSearch]     = useState("");
  const [heroSearch,     setHeroSearch]     = useState("");
  const [heroResults,    setHeroResults]    = useState([]);
  const [showHeroRes,    setShowHeroRes]    = useState(false);
  const [buildingFilter, setBuildingFilter] = useState(null); // null | "A" | "B"
  const DESKS_PER_PAGE = 4;

  const sliderControlRef    = useRef(null);
  const heroSearchRef       = useRef(null);
  const locatorResultsRef   = useRef(null);
  const t       = useT();
  const { language } = useLanguage();

  const sectorName = (s) => s.name?.[language] || s.name?.en || s.name || "";
  const sectorDesc = (s) => s.description?.[language] || s.description?.en || s.description || "";

  /* ── fetch data ── */
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [sectorsData, depts] = await Promise.all([
          sectorService.getPublicSectors(),
          departmentService.getAll(),
        ]);
        if (cancelled) return;
        setSectors(sectorsData || []);
        setDepartments(depts || []);
        let avgRating = 0;
        try {
          const fb = await API.get("/feedback/stats");
          avgRating = parseFloat(fb.data?.average || 0);
        } catch (e) { void e; /* ignore rating fetch */ }
        if (!cancelled)
          setStats({ totalDepts: depts?.length || 0, totalSectors: sectorsData?.length || 0, avgRating });
      } catch (err) {
        if (!cancelled) { console.error(err); setSectors([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const fetchAnnouncements = async () => {
      try {
        const res = await API.get("/announcements?active=true");
        const data = res.data.data || res.data || [];
        const now = new Date();
        setAnnouncements(
          data.filter(a => a.isActive && (!a.endDate || new Date(a.endDate) >= now)).slice(0, 3)
        );
      } catch (e) { void e; setAnnouncements([]); }
    };
    fetchData();
    fetchAnnouncements();
    return () => { cancelled = true; };
  }, []);

  /* ── slideshow ── */
  useEffect(() => {
    let alive = true;
    let timer = null;
    const runSlide = (idx) => {
      if (!alive) return;
      setSlideIndex(idx);
      timer = setTimeout(() => { if (!alive) return; runSlide((idx + 1) % HERO_SLIDES.length); }, SLIDE_MS);
    };
    sliderControlRef.current = (idx) => { clearTimeout(timer); runSlide(idx); };
    runSlide(0);
    return () => { alive = false; clearTimeout(timer); sliderControlRef.current = null; };
  }, []);

  /* ── paginated desks (with search + building filter) ── */
  const filteredDesks = departments.filter(dept => {
    const bld = buildingFilter
      ? (dept.building || "").toUpperCase().includes(buildingFilter.toUpperCase())
      : true;
    if (!deskSearch.trim()) return bld;
    const q = deskSearch.toLowerCase();
    const name    = (dept.name?.[language] || dept.name?.en || dept.name || "").toLowerCase();
    const head    = (dept.headName || dept.head?.name || dept.head || "").toLowerCase();
    const bldg    = (dept.building || "").toLowerCase();
    const floor   = String(dept.floor || "").toLowerCase();
    const room    = String(dept.room || "").toLowerCase();
    const wing    = (dept.wing || "").toLowerCase();
    const services = Array.isArray(dept.services)
      ? dept.services.join(" ").toLowerCase()
      : (typeof dept.services === "string" ? dept.services.toLowerCase() : "");
    return bld && (name.includes(q) || head.includes(q) || bldg.includes(q) ||
      floor.includes(q) || room.includes(q) || wing.includes(q) || services.includes(q));
  });

  const deskPages    = Math.ceil(filteredDesks.length / DESKS_PER_PAGE);
  const visibleDesks = filteredDesks.slice(deskPage * DESKS_PER_PAGE, (deskPage + 1) * DESKS_PER_PAGE);
  const prevPage = () => setDeskPage(p => Math.max(0, p - 1));
  const nextPage = () => setDeskPage(p => Math.min(deskPages - 1, p + 1));

  /* reset page when search/filter changes */
  useEffect(() => { setDeskPage(0); }, [deskSearch, buildingFilter]);

  /* ── hero search ── */
  useEffect(() => {
    const q = heroSearch.trim();
    if (q.length < 2) { setHeroResults([]); setShowHeroRes(false); return; }
    const lower = q.toLowerCase();
    const results = departments.filter(dept => {
      const name  = (dept.name?.[language] || dept.name?.en || dept.name || "").toLowerCase();
      const head  = (dept.headName || dept.head?.name || dept.head || "").toLowerCase();
      const wing  = (dept.wing || "").toLowerCase();
      const bldg  = (dept.building || "").toLowerCase();
      const svcs  = Array.isArray(dept.services)
        ? dept.services.join(" ").toLowerCase()
        : (typeof dept.services === "string" ? dept.services.toLowerCase() : "");
      return name.includes(lower) || head.includes(lower) || wing.includes(lower) ||
             bldg.includes(lower) || svcs.includes(lower);
    }).slice(0, 8);
    setHeroResults(results);
    setShowHeroRes(true);
  }, [heroSearch, departments, language]);

  /* ── close hero results on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (heroSearchRef.current && !heroSearchRef.current.contains(e.target))
        setShowHeroRes(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── building stats ── */
  const blockACount = departments.filter(d => (d.building || "").toUpperCase().includes("A")).length;
  const blockBCount = departments.filter(d => (d.building || "").toUpperCase() === "B").length;
  return (
    <Layout>
      <div className="min-h-screen" style={{ background: T.surface }}>

        {/* ── ANNOUNCEMENT BAR ── */}
        <AnimatePresence>
          {showAnnounce && announcements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }} transition={{ duration: 0.3 }}
              style={{ background: "#FFF8E6", borderBottom: "2px solid #E8A800", padding: "9px 0" }}
            >
              <div className="max-w-6xl mx-auto px-3 sm:px-4">
                <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0 text-xs font-extrabold uppercase"
                    style={{ background: "#E8A800", color: "#5A3A00", letterSpacing: "0.08em" }}>
                    <FiBell size={12} /> {t("notice")}
                  </div>
                  {announcements.map((a) => {
                    const s = priorityStyle(a.priority);
                    const title = typeof a.title === "object" ? (a.title[language] || a.title.en) : a.title;
                    const message = typeof a.message === "object" ? (a.message[language] || a.message.en) : a.message;
                    return (
                      <div key={a._id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }}>
                        <span>{typeIcon(a.type)}</span>
                        <span className="font-bold">{title}</span>
                        <span className="hidden sm:inline" style={{ color: "#7A5800" }}>·</span>
                        <span className="hidden sm:inline truncate max-w-xs" style={{ color: "#7A5800" }}>{message}</span>
                      </div>
                    );
                  })}
                  <button onClick={() => setShowAnnounce(false)}
                    className="ml-auto flex-shrink-0 p-1 rounded-full hover:opacity-60"
                    style={{ color: "#A07030", background: "none", border: "none", cursor: "pointer" }} aria-label="Dismiss">
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
        <div className="relative overflow-hidden" style={{ minHeight: "100svh" }}>
          {HERO_SLIDES.map((slide, i) => (
            <div key={slide.bg} className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: `url('${slide.bg}')`,
                opacity: slideIndex === i ? 1 : 0,
                transform: slideIndex === i ? "scale(1.0)" : "scale(1.08)",
                transition: "opacity 1.2s cubic-bezier(0.4,0,0.2,1), transform 5s linear",
                willChange: "opacity, transform",
              }} />
          ))}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(170deg, rgba(0,60,70,0.55) 0%, rgba(0,78,90,0.45) 50%, rgba(0,60,70,0.58) 100%)" }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(200,150,30,0.06) 0%, transparent 65%)" }} />

          <div className="relative z-10 flex flex-col" style={{ minHeight: "100svh" }}>
            <div className="hidden md:block" style={{ height: 40 }} />
            <div className="block md:hidden" style={{ height: 64 }} />
            <div className="flex-1 flex items-center py-8 sm:py-10 lg:py-0">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                  {/* HERO LEFT */}
                  <div>
                    <div className="text-xs font-black uppercase mb-3 md:mb-4 tracking-widest"
                      style={{ color: "#E8B84B", letterSpacing: "0.22em" }}>
                      MINT NAVIGATOR
                    </div>
                    <h1 className="font-black leading-none mb-1 md:mb-2 uppercase"
                      style={{ fontSize: "clamp(1.9rem, 9vw, 5.5rem)", color: "#FFFFFF", letterSpacing: "-0.02em",
                        textShadow: "0 4px 32px rgba(0,0,0,0.70)", lineHeight: 1.05 }}>
                      {t("hero_where")}
                    </h1>
                    <h1 className="font-black leading-none mb-1 md:mb-2 uppercase"
                      style={{ fontSize: "clamp(1.9rem, 9vw, 5.5rem)", color: "#E8B84B", letterSpacing: "-0.02em",
                        textShadow: "0 4px 32px rgba(200,150,30,0.50)", lineHeight: 1.05 }}>
                      {t("hero_would_you")}
                    </h1>
                    <h1 className="font-black leading-none mb-4 md:mb-6 uppercase"
                      style={{ fontSize: "clamp(1.9rem, 9vw, 5.5rem)", color: "#FFFFFF", letterSpacing: "-0.02em",
                        textShadow: "0 4px 32px rgba(0,0,0,0.70)", lineHeight: 1.05 }}>
                      {t("hero_like_to_go")}
                    </h1>
                    <div className="w-16 h-1 rounded-full mb-4 md:mb-5"
                      style={{ background: "linear-gradient(90deg, #E8B84B, transparent)" }} />
                    <p className="text-sm md:text-base font-medium mb-6 md:mb-8 leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.75)", maxWidth: 440 }}>
                      {t("hero_sub")}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      <Link to="/sectors" style={{ textDecoration: "none" }}>
                        <div className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-3.5 rounded-xl font-black uppercase text-xs md:text-sm"
                          style={{ background: "#E8B84B", color: "#071E35", letterSpacing: "0.10em", cursor: "pointer" }}>
                          <FiNavigation size={14} />
                          {language === "am" ? "ዘርፎችን ያሰሱ" : "EXPLORE SECTORS"}
                        </div>
                      </Link>
                      <Link to="/feedback" style={{ textDecoration: "none" }}>
                        <div className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-3.5 font-black uppercase text-xs md:text-sm"
                          style={{ background: "rgba(255,255,255,0.10)", color: "#fff", border: "2.5px solid #E8B84B",
                            letterSpacing: "0.10em", backdropFilter: "blur(8px)", cursor: "pointer", borderRadius: "0.75rem" }}>
                          <FiMessageSquare size={15} />
                          {t("hero_feedback_btn")}
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* HERO RIGHT — smart search (desktop/tablet only) */}
                  <div className="hidden lg:flex flex-col justify-center" style={{ minHeight: 460 }}>
                    <div className="mb-4">
                      <div className="text-xs font-black uppercase mb-2" style={{ color: "#E8B84B", letterSpacing: "0.22em" }}>
                        {language === "am" ? "ፈጣን ፍለጋ" : "FIND ANYTHING"}
                      </div>
                      <h2 className="font-black text-white mb-2"
                        style={{ fontSize: "clamp(1.4rem, 2.8vw, 2rem)", lineHeight: 1.15 }}>
                        {language === "am"
                          ? "ቢሮ፣ ዲፓርትመንት ወይም አገልግሎት ያግኙ"
                          : "Find an office, department, manager, or government service quickly and easily."}
                      </h2>
                    </div>

                    {/* Search input */}
                    <div ref={heroSearchRef} className="relative">
                      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                        style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(232,184,75,0.50)", backdropFilter: "blur(16px)" }}>
                        <FiSearch size={18} style={{ color: "#E8B84B", flexShrink: 0 }} />
                        <input
                          type="text"
                          value={heroSearch}
                          onChange={e => setHeroSearch(e.target.value)}
                          onFocus={() => heroSearch.trim().length >= 2 && setShowHeroRes(true)}
                          placeholder={language === "am" ? "ዲፓርትመንት፣ ኃላፊ ወይም አገልግሎት ይፈልጉ…" : "Search departments, managers, services…"}
                          className="flex-1 bg-transparent outline-none text-sm font-medium text-white placeholder-white"
                          style={{ color: "#fff", fontSize: 14 }}
                        />
                        {heroSearch && (
                          <button onClick={() => { setHeroSearch(""); setHeroResults([]); setShowHeroRes(false); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", padding: 0 }}>
                            <FiX size={15} />
                          </button>
                        )}
                      </div>

                      {/* Filter chips */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {(language === "am"
                          ? ["ዲፓርትመንቶች","ቢሮዎች","ሥራ አስኪያጆች","አገልግሎቶች","የፈጠራ ማዕከሎች"]
                          : ["Departments","Offices","Managers","Services","Innovation Centers"]
                        ).map((chip, i) => {
                          const enChips = ["Departments","Offices","Managers","Services","Innovation Centers"];
                          return (
                            <button key={chip}
                              onClick={() => setHeroSearch(enChips[i] === "Departments" || enChips[i] === "Innovation Centers" ? enChips[i] : enChips[i].slice(0,-1))}
                              className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                              style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.70)",
                                border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,184,75,0.20)"; e.currentTarget.style.color = "#E8B84B"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "rgba(255,255,255,0.70)"; }}>
                              {chip}
                            </button>
                          );
                        })}
                      </div>

                      {/* Search results dropdown */}
                      {showHeroRes && heroResults.length > 0 && (
                        <div className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                          style={{ background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,0.30)", border: `1.5px solid ${T.border}` }}>
                          <div className="px-4 py-2.5 flex items-center justify-between"
                            style={{ borderBottom: `1px solid ${T.border}`, background: T.surface }}>
                            <span className="text-xs font-black uppercase" style={{ color: T.textMuted, letterSpacing: "0.12em" }}>
                              {heroResults.length} {language === "am" ? "ውጤቶች ተገኝቷል" : "results found"}
                            </span>
                          </div>
                          <div style={{ maxHeight: 280, overflowY: "auto" }}>
                            {heroResults.map((dept) => {
                              const name    = dept.name?.[language] || dept.name?.en || dept.name || "";
                              const head    = dept.headName || dept.head?.name || dept.head || "";
                              const bldg    = dept.building ? `${t("bldg")} ${dept.building}` : "";
                              const flr     = dept.floor != null ? `${language === "am" ? "ፎቅ" : "Floor"} ${dept.floor}` : "";
                              return (
                                <Link key={dept.id}
                                  to={`/department/${dept.id}`}
                                  onClick={() => setShowHeroRes(false)}
                                  style={{ textDecoration: "none", display: "block" }}>
                                  <div className="flex items-start justify-between gap-3 px-4 py-3"
                                    style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = T.surface)}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold text-sm truncate" style={{ color: T.text }}>{name}</div>
                                      {head && <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{head}</div>}
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                                      {bldg && (
                                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                          style={{ background: `rgba(0,118,135,0.10)`, color: T.navy }}>{bldg}</span>
                                      )}
                                      {flr && (
                                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                          style={{ background: `rgba(200,150,30,0.12)`, color: T.gold }}>{flr}</span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {showHeroRes && heroSearch.trim().length >= 2 && heroResults.length === 0 && (
                        <div className="absolute left-0 right-0 mt-2 rounded-2xl px-4 py-6 text-center z-50"
                          style={{ background: "#fff", border: `1.5px solid ${T.border}`, boxShadow: "0 12px 32px rgba(0,0,0,0.15)" }}>
                          <FiSearch size={28} style={{ color: T.border, margin: "0 auto 8px" }} />
                          <p className="text-sm font-semibold" style={{ color: T.textSub }}>
                            {language === "am" ? "ምንም ውጤት አልተገኘም" : "No results found"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MOBILE / TABLET — compact search bar (shown below lg) */}
                  <div className="lg:hidden">
                    <div ref={heroSearchRef} className="relative">
                      <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl"
                        style={{ background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(232,184,75,0.50)", backdropFilter: "blur(16px)" }}>
                        <FiSearch size={17} style={{ color: "#E8B84B", flexShrink: 0 }} />
                        <input
                          type="text"
                          value={heroSearch}
                          onChange={e => setHeroSearch(e.target.value)}
                          onFocus={() => heroSearch.trim().length >= 2 && setShowHeroRes(true)}
                          placeholder={language === "am" ? "ፈልግ…" : "Search departments, offices…"}
                          className="flex-1 bg-transparent outline-none text-sm font-medium text-white placeholder-white"
                          style={{ color: "#fff", fontSize: 14, minWidth: 0 }}
                        />
                        {heroSearch && (
                          <button onClick={() => { setHeroSearch(""); setHeroResults([]); setShowHeroRes(false); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", padding: 0 }}>
                            <FiX size={15} />
                          </button>
                        )}
                      </div>

                      {showHeroRes && heroResults.length > 0 && (
                        <div className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                          style={{ background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,0.30)", border: `1.5px solid ${T.border}` }}>
                          <div className="px-4 py-2 flex items-center justify-between"
                            style={{ borderBottom: `1px solid ${T.border}`, background: T.surface }}>
                            <span className="text-xs font-black uppercase" style={{ color: T.textMuted, letterSpacing: "0.12em" }}>
                              {heroResults.length} {language === "am" ? "ውጤቶች" : "results"}
                            </span>
                          </div>
                          <div style={{ maxHeight: 240, overflowY: "auto" }}>
                            {heroResults.map((dept) => {
                              const name = dept.name?.[language] || dept.name?.en || dept.name || "";
                              const head = dept.headName || dept.head?.name || dept.head || "";
                              return (
                                <Link key={dept.id}
                                  to={`/department/${dept.id}`}
                                  onClick={() => setShowHeroRes(false)}
                                  style={{ textDecoration: "none", display: "block" }}>
                                  <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
                                    <div className="font-bold text-sm truncate" style={{ color: T.text }}>{name}</div>
                                    {head && <div className="text-xs mt-0.5 truncate" style={{ color: T.textSub }}>{head}</div>}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero bottom controls */}
            <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-12 pb-5 sm:pb-6">
              <div className="text-xs font-black" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em" }}>
                0{slideIndex + 1} / 0{HERO_SLIDES.length}
              </div>
              <div className="flex gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button key={i} onClick={() => sliderControlRef.current?.(i)} aria-label={`Slide ${i + 1}`}
                    style={{ width: slideIndex === i ? 32 : 8, height: 8,
                      borderRadius: slideIndex === i ? 4 : "50%",
                      background: slideIndex === i ? "#E8B84B" : "rgba(255,255,255,0.30)",
                      border: "none", cursor: "pointer", padding: 0, transition: "all 0.35s ease" }} />
                ))}
              </div>
            </div>
          </div>
          <div key={slideIndex} className="absolute bottom-0 left-0 z-20"
            style={{ height: 3, background: "linear-gradient(90deg, #C8961E, #E8B84B)",
              animation: `slideProgress ${SLIDE_MS}ms linear forwards` }} />
          <style>{`@keyframes slideProgress { from { width: 0% } to { width: 100% } }`}</style>
        </div>

        {/* ══════════════════════════════════════════
            OFFICE LOCATOR
        ══════════════════════════════════════════ */}
        <section style={{ background: `linear-gradient(160deg, ${T.text} 0%, ${T.navy} 55%, ${T.navyLight} 100%)` }} className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3"
                style={{ background: "rgba(232,184,75,0.15)", border: "1px solid rgba(232,184,75,0.35)", color: "#E8B84B", letterSpacing: "0.12em" }}>
                {language === "am" ? "ቢሮ መፈለጊያ" : "OFFICE LOCATOR"}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2">
                {language === "am" ? "ቢሮ ያግኙ" : "Find an Office"}
              </h2>
              <p className="text-sm px-2" style={{ color: "rgba(255,255,255,0.60)" }}>
                {language === "am"
                  ? "ህንፃ ይምረጡ — ሁሉም ጠረጴዛ እና ሥራ አስፈጻሚ ቢሮ ይታያል"
                  : "Choose a building to see every desk and executive office, grouped floor by floor."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto">
              {/* Building A */}
              <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}>
                <div className="rounded-2xl p-6 sm:p-8 text-center cursor-pointer relative overflow-hidden"
                  style={{ background: buildingFilter === "A"
                      ? "linear-gradient(135deg, rgba(232,184,75,0.30) 0%, rgba(232,184,75,0.12) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)",
                    border: buildingFilter === "A" ? "2px solid rgba(232,184,75,0.80)" : "1.5px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(16px)", transition: "all 0.25s",
                    boxShadow: buildingFilter === "A" ? "0 8px 40px rgba(232,184,75,0.20)" : "0 4px 24px rgba(0,0,0,0.15)" }}
                  onClick={() => {
                    const next = buildingFilter === "A" ? null : "A";
                    setBuildingFilter(next);
                    if (next) setTimeout(() => locatorResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
                  }}
                  onMouseEnter={e => { if (buildingFilter !== "A") { e.currentTarget.style.background = "linear-gradient(135deg, rgba(232,184,75,0.18) 0%, rgba(232,184,75,0.06) 100%)"; e.currentTarget.style.borderColor = "rgba(232,184,75,0.55)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(232,184,75,0.15)"; }}}
                  onMouseLeave={e => { if (buildingFilter !== "A") { e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)"; }}}>
                  {/* Selected glow ring */}
                  {buildingFilter === "A" && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ boxShadow: "inset 0 0 0 2px rgba(232,184,75,0.50)" }} />
                  )}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5"
                    style={{ background: buildingFilter === "A" ? "rgba(232,184,75,0.30)" : "rgba(232,184,75,0.15)",
                      border: `1.5px solid rgba(232,184,75,${buildingFilter === "A" ? "0.60" : "0.35"})` }}>
                    <FiGrid size={24} style={{ color: "#E8B84B" }} />
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "rgba(232,184,75,0.70)", letterSpacing: "0.20em" }}>
                    {language === "am" ? "ዋና ህንፃ" : "MAIN BUILDING"}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {language === "am" ? "ህንፃ A" : "Building A"}
                  </h3>
                  <div className="flex items-center justify-center gap-4 mb-5 sm:mb-6">
                    <div className="flex flex-col items-center">
                      <span className="text-lg sm:text-xl font-black" style={{ color: "#E8B84B" }}>{blockACount}</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>{language === "am" ? "ቢሮዎች" : "Offices"}</span>
                    </div>
                    <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.15)" }} />
                    <div className="flex flex-col items-center">
                      <span className="text-lg sm:text-xl font-black" style={{ color: "#E8B84B" }}>7</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>{language === "am" ? "ፎቆች" : "Floors"}</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm w-full justify-center"
                    style={{ background: buildingFilter === "A" ? "rgba(232,184,75,0.90)" : "#E8B84B",
                      color: T.text, letterSpacing: "0.04em",
                      boxShadow: "0 4px 16px rgba(232,184,75,0.30)" }}>
                    {buildingFilter === "A"
                      ? (language === "am" ? "✓ ተመርጧል" : "✓ Selected")
                      : (language === "am" ? "ቢሮዎችን ይመልከቱ" : "View Offices")}
                    {buildingFilter !== "A" && <FiArrowRight size={15} />}
                  </div>
                </div>
              </motion.div>

              {/* Building B */}
              <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}>
                <div className="rounded-2xl p-6 sm:p-8 text-center cursor-pointer relative overflow-hidden"
                  style={{ background: buildingFilter === "B"
                      ? "linear-gradient(135deg, rgba(232,184,75,0.30) 0%, rgba(232,184,75,0.12) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)",
                    border: buildingFilter === "B" ? "2px solid rgba(232,184,75,0.80)" : "1.5px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(16px)", transition: "all 0.25s",
                    boxShadow: buildingFilter === "B" ? "0 8px 40px rgba(232,184,75,0.20)" : "0 4px 24px rgba(0,0,0,0.15)" }}
                  onClick={() => {
                    const next = buildingFilter === "B" ? null : "B";
                    setBuildingFilter(next);
                    if (next) setTimeout(() => locatorResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
                  }}
                  onMouseEnter={e => { if (buildingFilter !== "B") { e.currentTarget.style.background = "linear-gradient(135deg, rgba(232,184,75,0.18) 0%, rgba(232,184,75,0.06) 100%)"; e.currentTarget.style.borderColor = "rgba(232,184,75,0.55)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(232,184,75,0.15)"; }}}
                  onMouseLeave={e => { if (buildingFilter !== "B") { e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)"; }}}>
                  {buildingFilter === "B" && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ boxShadow: "inset 0 0 0 2px rgba(232,184,75,0.50)" }} />
                  )}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5"
                    style={{ background: buildingFilter === "B" ? "rgba(232,184,75,0.30)" : "rgba(232,184,75,0.15)",
                      border: `1.5px solid rgba(232,184,75,${buildingFilter === "B" ? "0.60" : "0.35"})` }}>
                    <FiMapPin size={24} style={{ color: "#E8B84B" }} />
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "rgba(232,184,75,0.70)", letterSpacing: "0.20em" }}>
                    {language === "am" ? "ሁለተኛ ህንፃ" : "ANNEX BUILDING"}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {language === "am" ? "ህንፃ B" : "Building B"}
                  </h3>
                  <div className="flex items-center justify-center gap-4 mb-5 sm:mb-6">
                    <div className="flex flex-col items-center">
                      <span className="text-lg sm:text-xl font-black" style={{ color: "#E8B84B" }}>{blockBCount}</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>{language === "am" ? "ቢሮዎች" : "Offices"}</span>
                    </div>
                    <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.15)" }} />
                    <div className="flex flex-col items-center">
                      <span className="text-lg sm:text-xl font-black" style={{ color: "#E8B84B" }}>1</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>{language === "am" ? "ፎቅ" : "Floor"}</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm w-full justify-center"
                    style={{ background: buildingFilter === "B" ? "rgba(232,184,75,0.90)" : "#E8B84B",
                      color: T.text, letterSpacing: "0.04em",
                      boxShadow: "0 4px 16px rgba(232,184,75,0.30)" }}>
                    {buildingFilter === "B"
                      ? (language === "am" ? "✓ ተመርጧል" : "✓ Selected")
                      : (language === "am" ? "ቢሮዎችን ይመልከቱ" : "View Offices")}
                    {buildingFilter !== "B" && <FiArrowRight size={15} />}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Inline results panel ── */}
            <AnimatePresence>
              {buildingFilter && (
                <motion.div
                  ref={locatorResultsRef}
                  key={`locator-results-${buildingFilter}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className="mt-10 sm:mt-12"
                >
                  <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        {language === "am" ? `ህንፃ ${buildingFilter} ቢሮዎች` : `Building ${buildingFilter} Offices`}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>
                        {departments.filter(d => (d.building || "").toUpperCase().includes(buildingFilter)).length}
                        {" "}{language === "am" ? "ቢሮዎች ተገኝቷል" : "offices found"}
                      </p>
                    </div>
                    <button onClick={() => setBuildingFilter(null)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                      style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.80)",
                        border: "1px solid rgba(255,255,255,0.20)", cursor: "pointer" }}>
                      <FiX size={12} /> {language === "am" ? "ይዝጉ" : "Close"}
                    </button>
                  </div>

                  {(() => {
                    const bldgDepts = departments
                      .filter(d => (d.building || "").toUpperCase().includes(buildingFilter))
                      .sort((a, b) => (a.floor ?? 99) - (b.floor ?? 99) || (a.id ?? 0) - (b.id ?? 0));
                    const byFloor = bldgDepts.reduce((acc, d) => {
                      const fl = d.floor ?? 0;
                      if (!acc[fl]) acc[fl] = [];
                      acc[fl].push(d);
                      return acc;
                    }, {});
                    return Object.entries(byFloor).map(([floor, depts]) => (
                      <div key={floor} className="mb-7 sm:mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                            style={{ background: "#E8B84B", color: T.text }}>{floor}</div>
                          <span className="text-sm font-bold uppercase" style={{ color: "#E8B84B", letterSpacing: "0.12em" }}>
                            {language === "am" ? `ፎቅ ${floor}` : `Floor ${floor}`}
                          </span>
                          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
                            {depts.length} {language === "am" ? "ቢሮዎች" : "offices"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {depts.map((dept, idx) => {
                            const dName = dept.name?.[language] || dept.name?.en || dept.name || "";
                            const headName = dept.headName || dept.head || "";
                            return (
                              <motion.div key={dept.id}
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.04 }}>
                                <Link to={`/department/${dept.id}`} style={{ textDecoration: "none", display: "block" }}>
                                  <div className="rounded-xl p-4 h-full cursor-pointer"
                                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                                      backdropFilter: "blur(8px)", transition: "all 0.2s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,184,75,0.15)"; e.currentTarget.style.borderColor = "rgba(232,184,75,0.50)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4 className="font-bold text-sm leading-snug text-white flex-1">{dName}</h4>
                                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                                        style={{ background: "rgba(232,184,75,0.20)", color: "#E8B84B" }}>
                                        {language === "am" ? `ክ ${dept.room}` : `Rm ${dept.room}`}
                                      </span>
                                    </div>
                                    {headName && (
                                      <div className="flex items-center gap-1.5 text-xs mb-3"
                                        style={{ color: "rgba(255,255,255,0.55)" }}>
                                        <FiUser size={11} /> {headName}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs font-bold"
                                      style={{ color: "#E8B84B", letterSpacing: "0.06em" }}>
                                      {language === "am" ? "ዝርዝር ይመልከቱ" : "View Details"} <FiArrowRight size={11} />
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            MOST VISITED DESKS
        ══════════════════════════════════════════ */}
        <section id="desks-section" style={{ background: T.surface }} className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3"
                  style={{ background: `rgba(0,118,135,0.08)`, color: T.navy, border: `1px solid ${T.border}`, letterSpacing: "0.12em" }}>
                  <FiLayers size={11} /> {language === "am" ? "ዲፓርትመንቶች" : "DESKS & DEPARTMENTS"}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black" style={{ color: T.text }}>
                  {language === "am" ? "ብዙ ጊዜ የሚጎበኙ ጠረጴዛዎች" : "Most Visited Desks"}
                </h2>
                <p className="text-sm mt-1" style={{ color: T.textSub }}>
                  {language === "am"
                    ? "ብዙ ጊዜ የሚጎበኙ ዲፓርትመንቶች፣ ሥራ አስፈጻሚዎች እና ሥራ አስኪያጆች"
                    : "The busiest desks, executives, and managers. Search by name, manager, block, floor, room, or service."}
                </p>
              </div>
              {/* Desk search + pagination */}
              <div className="flex flex-col gap-2 sm:items-end flex-shrink-0">
                {/* Search input */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full sm:w-72"
                  style={{ background: T.card, border: `1.5px solid ${T.border}`, boxShadow: "0 1px 6px rgba(0,118,135,0.07)" }}>
                  <FiSearch size={15} style={{ color: T.textMuted, flexShrink: 0 }} />
                  <input
                    type="text"
                    value={deskSearch}
                    onChange={e => setDeskSearch(e.target.value)}
                    placeholder={language === "am" ? "ስም፣ ኃላፊ፣ ፎቅ፣ ቤተ-ቁጥር…" : "Search name, manager, floor, room…"}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: T.text, fontSize: 13 }}
                  />
                  {deskSearch && (
                    <button onClick={() => setDeskSearch("")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 0, lineHeight: 0 }}>
                      <FiX size={13} />
                    </button>
                  )}
                </div>
                {/* Pagination */}
                {deskPages > 1 && (
                  <div className="hidden sm:flex items-center gap-2">
                    <button onClick={prevPage} disabled={deskPage === 0}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                      style={{ background: T.card, border: `1px solid ${T.border}`, color: T.navy, cursor: deskPage === 0 ? "not-allowed" : "pointer" }}>
                      <FiChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold px-3 py-2 rounded-xl"
                      style={{ background: T.card, border: `1px solid ${T.border}`, color: T.textSub }}>
                      {deskPage + 1} / {deskPages}
                    </span>
                    <button onClick={nextPage} disabled={deskPage >= deskPages - 1}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                      style={{ background: T.card, border: `1px solid ${T.border}`, color: T.navy, cursor: deskPage >= deskPages - 1 ? "not-allowed" : "pointer" }}>
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Active filter indicator */}
            {buildingFilter && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  style={{ background: `rgba(0,118,135,0.10)`, color: T.navy, border: `1px solid ${T.border}` }}>
                  <FiMapPin size={11} />
                  {language === "am" ? "ህንፃ" : "Building"} {buildingFilter}
                  <button onClick={() => setBuildingFilter(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: T.navy, padding: 0, marginLeft: 2, lineHeight: 0 }}>
                    <FiX size={11} />
                  </button>
                </span>
                <span className="text-xs" style={{ color: T.textMuted }}>
                  {filteredDesks.length} {language === "am" ? "ቢሮዎች" : "offices"}
                </span>
              </div>
            )}

            {/* Desk cards */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                    style={{ background: T.card, border: `1px solid ${T.border}`, height: 220 }}>
                    <div style={{ height: 80, background: T.border }} />
                    <div className="p-4 flex flex-col gap-3">
                      <div style={{ height: 14, background: T.border, borderRadius: 6, width: "70%" }} />
                      <div style={{ height: 10, background: T.border, borderRadius: 6, width: "50%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-16" style={{ color: T.textMuted }}>
                <FiLayers size={40} className="mx-auto mb-3 opacity-25" />
                <p>{language === "am" ? "ምንም ዲፓርትመንት አልተገኘም" : "No departments found"}</p>
              </div>
            ) : filteredDesks.length === 0 ? (
              <div className="text-center py-16" style={{ color: T.textMuted }}>
                <FiSearch size={40} className="mx-auto mb-3 opacity-25" />
                <p className="font-semibold mb-1" style={{ color: T.textSub }}>
                  {language === "am" ? "ምንም ውጤት አልተገኘም" : "No results found"}
                </p>
                <p className="text-xs">{language === "am" ? "ፍለጋዎን ይቀይሩ" : "Try a different search term or clear the filter."}</p>
                <button onClick={() => { setDeskSearch(""); setBuildingFilter(null); }}
                  className="mt-4 text-xs font-bold px-4 py-2 rounded-xl"
                  style={{ background: `rgba(0,118,135,0.10)`, color: T.navy, border: `1px solid ${T.border}`, cursor: "pointer" }}>
                  {language === "am" ? "ሁሉንም አሳይ" : "Clear filters"}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" style={{ alignItems: "stretch" }}>
                  {visibleDesks.map((dept, idx) => {
                    const deptName = dept.name?.[language] || dept.name?.en || dept.name || "";
                    const headName = dept.headName || dept.head?.name || dept.head || "";
                    const floor    = dept.floor != null ? `${language === "am" ? "ፎቅ" : "Floor"} ${dept.floor}` : "";
                    const building = dept.building ? `${t("bldg")} ${dept.building}` : "";
                    const managerImg = dept.headImage || defaultManagerImg;
                    return (
                      <motion.div key={dept.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.07 }}
                        whileHover={{ y: -4, transition: { duration: 0.18 } }}
                        style={{ display: "flex" }}>
                        <Link to={`/department/${dept.id}`} style={{ textDecoration: "none", display: "flex", width: "100%" }}>
                          <div className="rounded-2xl overflow-hidden group cursor-pointer flex flex-col w-full"
                            style={{ background: T.card, border: `1px solid ${T.border}`, minHeight: 260,
                              boxShadow: "0 2px 12px rgba(0,118,135,0.07)", transition: "box-shadow 0.2s, border-color 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,118,135,0.16)"; e.currentTarget.style.borderColor = T.navy; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,118,135,0.07)"; e.currentTarget.style.borderColor = T.border; }}>

                            {/* Top bar: badge + stars */}
                            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                              <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full"
                                style={{ background: `rgba(0,118,135,0.09)`, color: T.navy, letterSpacing: "0.10em" }}>
                                {t("most_visited")}
                              </span>
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <FiStar key={s} size={10} style={{ color: T.gold, fill: T.gold }} />
                                ))}
                              </div>
                            </div>

                            <div className="px-4 pb-4 flex flex-col flex-1">
                              {/* Manager row: profile image top-left + name */}
                              <div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl"
                                style={{ background: `rgba(0,118,135,0.05)`, border: `1px solid ${T.border}` }}>
                                <img
                                  src={managerImg}
                                  alt={headName || "Manager"}
                                  className="rounded-full object-cover object-top flex-shrink-0"
                                  style={{ width: 44, height: 44, border: `2.5px solid ${T.navy}` }}
                                  onError={e => { e.target.src = defaultManagerImg; }}
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold truncate"
                                    style={{ color: T.textMuted, lineHeight: 1.2 }}>
                                    {language === "am" ? "ኃላፊ" : "Manager"}
                                  </div>
                                  <div className="text-xs font-bold truncate"
                                    style={{ color: T.text, lineHeight: 1.3 }}>
                                    {headName || (language === "am" ? "አልተመደበም" : "Not assigned")}
                                  </div>
                                </div>
                              </div>

                              {/* Department name */}
                              <h3 className="font-extrabold text-sm leading-snug mb-2 flex-1" style={{ color: T.text }}>
                                {deptName}
                              </h3>

                              {/* Location badges */}
                              <div className="flex items-center gap-2 flex-wrap mb-3">
                                {building && (
                                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                                    style={{ background: `rgba(0,118,135,0.08)`, color: T.navy }}>
                                    <FiMapPin size={9} style={{ display:"inline", marginRight:3 }} />{building}
                                  </span>
                                )}
                                {floor && (
                                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                                    style={{ background: `rgba(200,150,30,0.10)`, color: T.gold }}>{floor}</span>
                                )}
                              </div>

                              {/* CTA */}
                              <div className="flex items-center gap-1.5 text-xs font-black uppercase mt-auto"
                                style={{ color: T.navy, letterSpacing: "0.08em" }}>
                                {t("view_desk")} <FiArrowRight size={12} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                {/* Mobile pagination */}
                {deskPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-6 sm:hidden">
                    <button onClick={prevPage} disabled={deskPage === 0}
                      className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
                      style={{ background: T.card, border: `1px solid ${T.border}`, color: T.navy }}>
                      {t("prev_btn")}
                    </button>
                    <span className="text-xs font-bold" style={{ color: T.textMuted }}>{deskPage + 1} / {deskPages}</span>
                    <button onClick={nextPage} disabled={deskPage >= deskPages - 1}
                      className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
                      style={{ background: T.card, border: `1px solid ${T.border}`, color: T.navy }}>
                      {t("next_btn")}
                    </button>
                  </div>
                )}
                {/* Result count */}
                {deskSearch && (
                  <p className="text-center text-xs mt-3" style={{ color: T.textMuted }}>
                    {filteredDesks.length} {language === "am" ? "ውጤቶች" : "results"} {language === "am" ? "ለ" : "for"} "{deskSearch}"
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MINISTRY SECTORS GRID
        ══════════════════════════════════════════ */}
        <section style={{ background: T.surface }} className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3"
                  style={{ background: `rgba(0,118,135,0.08)`, color: T.navy, border: `1px solid ${T.border}`, letterSpacing: "0.10em" }}>
                  <FiGrid size={11} /> {t("browse_sector")}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black" style={{ color: T.text }}>{t("ministry_sectors")}</h2>
                <p className="text-sm mt-1" style={{ color: T.textSub }}>{t("sectors_sub")}</p>
              </div>
              <span className="text-xs font-bold px-4 py-2 rounded-full uppercase self-start sm:self-auto"
                style={{ background: T.border, color: T.textSub, letterSpacing: "0.09em" }}>
                {sectors.length} {sectors.length === 1 ? t("sector_count_one") : t("sector_count_many")}
              </span>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 ${
              sectors.length === 3 ? "lg:grid-cols-3" :
              sectors.length === 2 ? "lg:grid-cols-2" :
              sectors.length >= 4 ? "xl:grid-cols-4" : ""}`}>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                      style={{ background: T.card, border: `1px solid ${T.border}`, height: 380 }}>
                      <div style={{ height: 200, background: T.border }} />
                      <div className="p-6 flex flex-col gap-3">
                        <div style={{ height: 16, background: T.border, borderRadius: 6, width: "70%" }} />
                        <div style={{ height: 12, background: T.border, borderRadius: 6, width: "90%" }} />
                      </div>
                    </div>
                  ))
                : sectors.map((sector) => (
                    <motion.div key={sector.id} className="flex"
                      whileHover={{ y: -6, transition: { duration: 0.22 } }}>
                      <Link to={`/sector/${sector.id}`}
                        className="group flex flex-col rounded-2xl overflow-hidden w-full"
                        style={{ background: T.card, border: `1px solid ${T.border}`,
                          boxShadow: "0 2px 12px rgba(11,42,74,0.07)", transition: "box-shadow .25s, border-color .25s",
                          textDecoration: "none", cursor: "pointer", display: "flex" }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 24px 56px rgba(11,42,74,0.18)"; e.currentTarget.style.borderColor = T.gold; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(11,42,74,0.07)"; e.currentTarget.style.borderColor = T.border; }}>
                        <div className="relative overflow-hidden" style={{ height: 190 }}>
                          <img src={getSectorImage(sector)} alt={sectorName(sector)} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0"
                            style={{ background: "linear-gradient(to top, rgba(0,94,110,0.72) 0%, transparent 55%)" }} />
                          <span className="absolute top-3 left-3 text-xs font-bold text-white px-3 py-1.5 rounded-lg"
                            style={{ background: T.navy, border: "1px solid rgba(255,255,255,0.16)" }}>
                            {t("bldg")} {sector.building}
                          </span>
                          <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ background: T.gold, color: T.navyDark }}>
                            {sector.departmentCount || 0} {t("depts_abbr")}
                          </span>
                        </div>
                        <div className="p-5 sm:p-6 flex flex-col flex-1">
                          <h3 className="font-extrabold text-base sm:text-lg leading-snug mb-3" style={{ color: T.text }}>
                            {sectorName(sector)}
                          </h3>
                          <p className="text-sm font-medium leading-relaxed flex-1" style={{ color: T.textSub }}>
                            {sectorDesc(sector).substring(0, 120)}
                          </p>
                          <div className="flex items-center justify-between pt-4 mt-4"
                            style={{ borderTop: `1px solid ${T.border}` }}>
                            <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: T.text }}>
                              <FiMapPin size={13} style={{ color: T.gold }} /> {t("building")} {sector.building}
                            </div>
                            {sector.avgRating && (
                              <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: T.gold }}>
                                <FiStar size={13} style={{ fill: T.gold }} />
                                {typeof sector.avgRating === "number" ? sector.avgRating.toFixed(1) : sector.avgRating}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-4 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl transition-all"
                            style={{ background: "rgba(0,118,135,0.10)", border: `1px solid rgba(0,118,135,0.22)` }}>
                            <span className="text-xs sm:text-sm font-bold uppercase" style={{ color: T.navy, letterSpacing: "0.12em" }}>
                              {t("view_details")}
                            </span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: T.navy }}>
                              <FiArrowRight size={14} color="#fff" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            POPULAR SERVICES
        ══════════════════════════════════════════ */}
        <section style={{ background: T.card }} className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3"
                style={{ background: `rgba(0,118,135,0.08)`, color: T.navy, border: `1px solid ${T.border}`, letterSpacing: "0.12em" }}>
                {language === "am" ? "አገልግሎቶች" : "SERVICES"}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-2" style={{ color: T.text }}>
                {language === "am" ? "ታዋቂ የመንግስት አገልግሎቶች" : "Popular Government Services"}
              </h2>
              <p className="text-sm px-2" style={{ color: T.textSub }}>
                {language === "am"
                  ? "ዲጂታል አገልግሎቶች — ፈጣን፣ ግልጽ እና ለሁሉም ሰው ተደራሽ"
                  : "Digital-first public services designed to be fast, transparent, and accessible."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[
                { icon:<FiGrid size={22}/>,     title:language==="am"?"ዲጂታል ምዝገባ":"Digital Registration",   desc:language==="am"?"ንግድ እና ስታርት አፕ ይመዝግቡ":"Register businesses, startups, and technology ventures through a single online portal." },
                { icon:<FiStar size={22}/>,     title:language==="am"?"ስታርት አፕ ድጋፍ":"Startup Support",          desc:language==="am"?"ፈንድ፣ አማካሪ እና ኢንኩቤሽን":"Access funding, mentorship, and incubation programs for early-stage founders." },
                { icon:<FiGlobe size={22}/>,    title:language==="am"?"ICT አገልግሎቶች":"ICT Services",              desc:language==="am"?"ዲጂታል ኢንፍራስትራክቸር":"Government cloud, connectivity, and digital infrastructure support services." },
                { icon:<FiInfo size={22}/>,     title:language==="am"?"የፈጠራ ፈቃድ":"Innovation Licensing",      desc:language==="am"?"የቴክኖሎጂ ሊሰንስ ያውጡ":"Apply for innovation, intellectual property, and technology deployment licenses." },
                { icon:<FiSearch size={22}/>,   title:language==="am"?"የምርምር አገልግሎቶች":"Research Services",      desc:language==="am"?"ሀገራዊ ምርምር ይተባበሩ":"Collaborate on national research programs and technology development grants." },
                { icon:<FiUsers size={22}/>,    title:language==="am"?"የቴክኖሎጂ ምክር":"Technology Consultation",   desc:language==="am"?"ዲጂታል የምክር አገልግሎት":"Advisory services for digital adoption across public and private institutions." },
              ].map((svc, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ duration:0.35, delay:i*0.07 }}
                  whileHover={{ y:-4, transition:{ duration:0.18 } }}>
                  <div className="p-5 sm:p-6 rounded-2xl h-full group cursor-pointer"
                    style={{ background: T.surface, border:`1px solid ${T.border}`,
                      boxShadow:"0 1px 8px rgba(0,118,135,0.06)", transition:"all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow="0 16px 40px rgba(0,118,135,0.14)"; e.currentTarget.style.borderColor=T.navy; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow="0 1px 8px rgba(0,118,135,0.06)"; e.currentTarget.style.borderColor=T.border; }}>
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background:`rgba(0,118,135,0.10)`, color:T.navy }}>
                      {svc.icon}
                    </div>
                    <h3 className="font-extrabold text-base mb-2" style={{ color:T.text }}>{svc.title}</h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color:T.textSub }}>{svc.desc}</p>
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase" style={{ color:T.navy, letterSpacing:"0.08em" }}>
                      {language==="am"?"ተጨማሪ":"Learn More"} <FiArrowRight size={12} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MINISTRY AT A GLANCE — Stats
        ══════════════════════════════════════════ */}
        <section style={{ background: `linear-gradient(160deg, ${T.text} 0%, ${T.navy} 60%, ${T.navyLight} 100%)` }} className="py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2">
                {language === "am" ? "ሚኒስቴሩ በአንድ ሩጫ" : "The Ministry at a glance"}
              </h2>
              <p className="text-sm px-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                {language === "am"
                  ? "ለኢትዮጵያ የፈጠራ ሥነ-ምህዳር ዕለት ዕለት አገልግሎት"
                  : "Serving Ethiopia's innovation ecosystem every single day."}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 md:gap-6">
              <StatItem value={stats.totalDepts || 40}   suffix="+" label={language==="am"?"ዲፓርትመንቶች":"Departments"} />
              <StatItem value={500}                       suffix="+" label={language==="am"?"ሠራተኞች":"Staff Members"} />
              <StatItem value={6}                         suffix=""  label={language==="am"?"አገልግሎቶች":"Government Services"} />
              <StatItem value={2}                         suffix=""  label={language==="am"?"ህንፃዎች":"Buildings"} />
              <StatItem value={300}                       suffix="+" label={language==="am"?"ዕለታዊ ጎብኚዎች":"Daily Visitors"} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CONTACT SECTION
        ══════════════════════════════════════════ */}
        <section style={{ background: T.surface }} className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3"
                style={{ background:`rgba(0,118,135,0.08)`, color:T.navy, border:`1px solid ${T.border}`, letterSpacing:"0.12em" }}>
                {language==="am"?"ያግኙን":"CONTACT"}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-2" style={{ color:T.text }}>
                {language==="am"?"ሚኒስቴሩን ያግኙ":"Get in touch with the Ministry"}
              </h2>
              <p className="text-sm px-2" style={{ color:T.textSub }}>
                {language==="am"
                  ? "ትክክለኛ ቢሮ፣ ዲፓርትመንት ወይም አገልግሎት እንዲያገኙ እናግዝዎታለን"
                  : "We are here to help you find the right office, department, or service."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                {
                  icon: <FiMapPin size={22} />,
                  title: language==="am"?"አድራሻ":"MINISTRY ADDRESS",
                  value: language==="am"?"ፒያሳ፣ አዲስ አበባ":"Piassa, Addis Ababa, Ethiopia",
                  href: null,
                },
                {
                  icon: <FiPhone size={22} />,
                  title: language==="am"?"ስልክ":"TELEPHONE",
                  value: "+251 111 265 737",
                  href: "tel:+251111265737",
                },
                {
                  icon: <FiMail size={22} />,
                  title: language==="am"?"ኢሜይል":"EMAIL",
                  value: "contact@mint.gov.et",
                  href: "mailto:contact@mint.gov.et",
                },
                {
                  icon: <FiInfo size={22} />,
                  title: language==="am"?"የሥራ ሰዓት":"WORKING HOURS",
                  value: language==="am"?"ሰኞ – አርብ · ከ2:30 – 11:30":"Monday – Friday · 8:30 AM – 5:30 PM",
                  href: null,
                },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ duration:0.35, delay:i*0.08 }}>
                  <div className="p-5 sm:p-6 rounded-2xl h-full"
                    style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 1px 8px rgba(0,118,135,0.06)" }}>
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background:`rgba(0,118,135,0.10)`, color:T.navy }}>
                      {item.icon}
                    </div>
                    <div className="text-xs font-black uppercase mb-2" style={{ color:T.textMuted, letterSpacing:"0.12em" }}>
                      {item.title}
                    </div>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-semibold"
                        style={{ color:T.navy, textDecoration:"none" }}
                        onMouseEnter={e=>(e.currentTarget.style.textDecoration="underline")}
                        onMouseLeave={e=>(e.currentTarget.style.textDecoration="none")}>
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold leading-relaxed" style={{ color:T.text }}>{item.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-8 sm:mt-10">
              <a href="mailto:contact@mint.gov.et"
                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm text-white"
                style={{ background:`linear-gradient(90deg, ${T.navy}, ${T.navyLight})`,
                  textDecoration:"none", boxShadow:`0 8px 24px rgba(0,118,135,0.35)` }}>
                <FiMail size={16} />
                {language==="am"?"ያግኙን":"Contact Us"}
              </a>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Home;