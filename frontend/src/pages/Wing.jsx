import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import { getFloorLabel } from "../utils/floorLabels";
import { departmentService } from "../services/departmentService";
import { sectorService } from "../services/sectorService";
import { getDeptImage } from "../data/imageMap";
import { useLanguage } from "../hooks/useLanguage";
import { useT } from "../hooks/useT";
import {
  FiArrowLeft, FiChevronRight, FiHome, FiMapPin,
  FiLayers, FiUser, FiStar, FiPhone, FiMail,
  FiMessageCircle, FiArrowRight,
} from "react-icons/fi";

const C = {
  bg:    "#F7F9FC",
  navy:  "#086976",
  navyD: "#071E35",
  navyL: "#1C3F65",
  gold:  "#C8961E",
  goldL: "#E8B84B",
  white: "#FFFFFF",
  border:"#E2EAF4",
  text:  "#0D1B2A",
  sub:   "#526070",
  muted: "#8FA0B4",
  green: "#0d6e3c",
  greenL:"#e6f5ee",
};

export default function Wing() {
  const { sectorId, wingName } = useParams();
  const { language } = useLanguage();
  const t = useT();
  const decodedWing = decodeURIComponent(wingName);

  const [sector,  setSector]  = useState(null);
  const [desks,   setDesks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const sid  = parseInt(sectorId, 10);
        const lang = language || "en";
        const [sectorData, allDepts] = await Promise.all([
          sectorService.getPublicSectorById(sid),
          departmentService.getAll(),
        ]);
        setSector({
          ...sectorData,
          name: sectorData.name?.[lang] || sectorData.name?.en || sectorData.name || "",
        });
        const filtered = (allDepts || [])
          .filter(d => d.sectorId === sid && (d.wing || "") === decodedWing)
          .map(d => ({
            id:       d.id,
            name:     d.name?.[lang]        || d.name?.en        || "Unnamed",
            desc:     d.description?.[lang] || d.description?.en || "",
            building: d.building || "A",
            floor:    d.floor ?? null,
            room:     d.room    || "",
            head:     d.head    || "",
            phone:    d.contact || "",
            email:    d.email   || "",
            services: Array.isArray(d.services?.[lang]) && d.services[lang].length > 0
                        ? d.services[lang]
                        : Array.isArray(d.services?.en) ? d.services.en : [],
            rating:   parseFloat(d.rating) || 0,
            image:    getDeptImage(d),
          }));
        setDesks(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [sectorId, wingName, language]);

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: `${C.gold} transparent ${C.gold} ${C.gold}` }} />
          <p className="text-sm font-medium" style={{ color: C.muted }}>{t("loading_desks")}</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: C.bg }}>

        {/* ══ HERO ══ */}
        <div className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${C.navyD} 0%, ${C.navy} 60%, ${C.navyL} 100%)` }}>
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: C.goldL }} />

          <div className="relative max-w-6xl mx-auto px-5 py-10">
            {/* breadcrumb */}
            <motion.nav className="flex items-center gap-2 text-xs mb-8 flex-wrap"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Link to="/" className="flex items-center gap-1 hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.40)" }}><FiHome size={11} /> {t("nav_home")}</Link>
              <FiChevronRight size={10} style={{ color: "rgba(255,255,255,0.20)" }} />
              <Link to="/sectors" className="hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.40)" }}>{t("nav_sectors")}</Link>
              <FiChevronRight size={10} style={{ color: "rgba(255,255,255,0.20)" }} />
              <Link to={`/sector/${sectorId}`} className="hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.40)" }}>{sector?.name}</Link>
              <FiChevronRight size={10} style={{ color: "rgba(255,255,255,0.20)" }} />
              <span className="font-semibold" style={{ color: C.goldL }}>{decodedWing}</span>
            </motion.nav>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4"
                style={{ background: "rgba(232,184,75,0.15)", border: "1px solid rgba(232,184,75,0.35)", color: C.goldL, letterSpacing: "0.14em" }}>
                {t("dept_badge")}
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight"
                style={{ letterSpacing: "-0.02em" }}>
                {decodedWing}
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>
                {desks.length} {desks.length === 1 ? t("depts_abbr") : t("depts_abbr")} — {t("view_details").toLowerCase()}
              </p>
            </motion.div>
          </div>
        </div>

        {/* ══ DESKS ══ */}
        <div className="max-w-6xl mx-auto px-5 py-10">

          {desks.length === 0 ? (
            <div className="text-center py-24" style={{ color: C.muted }}>
              <p className="text-lg font-semibold">{t("no_desks_found")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {desks.map((desk, idx) => {
                const floorLabel = desk.floor != null ? getFloorLabel(desk.floor, language) : t("tbd_floor");
                const hasHead    = desk.head && desk.head !== "TBD" && desk.head !== "";
                const hasLocation = desk.room && desk.room !== "TBD";
                return (
                  <motion.div key={desk.id}
                    className="h-full"
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.05 }}>

                    <div className="rounded-2xl overflow-hidden group flex flex-col h-full"
                      style={{
                        background: C.white,
                        border: `1px solid ${C.border}`,
                        boxShadow: "0 2px 16px rgba(11,42,74,0.06)",
                        transition: "box-shadow 0.2s, border-color 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 16px 48px rgba(11,42,74,0.14)"; e.currentTarget.style.borderColor=C.gold; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 16px rgba(11,42,74,0.06)"; e.currentTarget.style.borderColor=C.border; }}>

                      {/* image strip */}
                      <div className="relative h-28 overflow-hidden">
                        <img src={desk.image} alt={desk.name} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={e => { e.target.src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=200&fit=crop&q=80"; }} />
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ background: "linear-gradient(to top, rgba(7,30,53,0.70) 0%, transparent 60%)" }} />

                        {/* floor + room badge */}
                        <div className="absolute bottom-3 left-4 flex gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
                            <FiLayers size={10} /> {floorLabel}
                          </span>
                          {hasLocation && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
                              <FiMapPin size={10} /> {t("rm_abbr")} {desk.room}
                            </span>
                          )}
                        </div>

                        {/* status dot */}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{
                              background: hasHead ? C.greenL : "rgba(255,255,255,0.15)",
                              color: hasHead ? C.green : "rgba(255,255,255,0.85)",
                              backdropFilter: "blur(6px)",
                            }}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: hasHead ? C.green : "rgba(255,255,255,0.60)" }} />
                            {hasHead ? t("active_status") : t("tbd_status")}
                          </span>
                        </div>
                      </div>

                      {/* card body */}
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-extrabold text-sm leading-snug" style={{ color: C.text }}>
                            {desk.name}
                          </h3>
                          {desk.rating > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                              style={{ background: "rgba(200,150,30,0.10)", color: "#7A5A00", border: "1px solid rgba(200,150,30,0.25)" }}>
                              <FiStar size={10} /> {Number(desk.rating).toFixed(1)}
                            </span>
                          )}
                        </div>

                        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: C.sub }}>
                          {desk.desc}
                        </p>

                        {/* Personnel row */}
                        {hasHead && (
                          <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl"
                            style={{ background: "rgba(11,42,74,0.04)", border: "1px solid rgba(11,42,74,0.08)" }}>
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                              style={{ border: `1px solid rgba(11,42,74,0.20)` }}>
                              <img
                                src={`https://randomuser.me/api/portraits/${desk.id % 2 === 0 ? "men" : "women"}/${(desk.id || 1) % 70 + 1}.jpg`}
                                alt={desk.head}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  e.target.style.display = "none";
                                  const p = e.target.parentNode;
                                  p.style.display = "flex";
                                  p.style.alignItems = "center";
                                  p.style.justifyContent = "center";
                                  p.style.background = `linear-gradient(135deg, ${C.navy}, ${C.navyL})`;
                                  p.style.color = "#fff";
                                  p.style.fontSize = "10px";
                                  p.style.fontWeight = "bold";
                                  p.textContent = desk.head.split(" ").map(w => w[0]).slice(0,2).join("");
                                }}
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold" style={{ color: C.text }}>{desk.head}</div>
                              <div className="text-xs" style={{ color: C.muted }}>{t("dept_head")}</div>
                            </div>
                          </div>
                        )}

                        {/* Services */}
                        {desk.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {desk.services.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-lg"
                                style={{ background: "rgba(11,42,74,0.05)", color: C.navyL, border: "1px solid rgba(11,42,74,0.10)" }}>
                                {s}
                              </span>
                            ))}
                            {desk.services.length > 3 && (
                              <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ color: C.gold }}>
                                +{desk.services.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* contact mini row */}
                        {(desk.phone || desk.email) && (
                          <div className="flex gap-2 mb-3">
                            {desk.phone && (
                              <a href={`tel:${desk.phone}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                                style={{ background: "rgba(11,42,74,0.06)", color: C.navyL, textDecoration: "none" }}>
                                <FiPhone size={11} /> {t("call_btn")}
                              </a>
                            )}
                            {desk.email && (
                              <a href={`mailto:${desk.email}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                                style={{ background: "rgba(11,42,74,0.06)", color: C.navyL, textDecoration: "none" }}>
                                <FiMail size={11} /> {t("email_btn")}
                              </a>
                            )}
                          </div>
                        )}

                        {/* CTA row */}
                        <div className="flex gap-3 mt-auto pt-3">
                          <Link to={`/department/${desk.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold text-white"
                            style={{ background: `linear-gradient(90deg, ${C.navy}, ${C.navyL})`, textDecoration: "none", letterSpacing: "0.03em" }}>
                            {t("view_details")} <FiArrowRight size={13} />
                          </Link>
                          <Link to={`/feedback/${desk.id}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold"
                            style={{ background: "rgba(200,150,30,0.10)", color: C.gold, border: `1px solid rgba(200,150,30,0.25)`, textDecoration: "none" }}>
                            <FiMessageCircle size={15} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
