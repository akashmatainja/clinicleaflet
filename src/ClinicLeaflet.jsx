import React, { useEffect, useMemo, useRef, useState } from "react";

/* ==================================================================
   D D Health — QR landing page (mobile first)
   URL shape:  https://your-domain.com/clinic?id=5272

   ── THEMES ───────────────────────────────────────────────────────
   clinic.leaflet_theme picks a whole interface, not just a palette.
   Tier names are labels only — the colours are chosen to look good,
   with the richest treatment on the highest tier:

     platinum  violet   · premium cards, schedule in a bottom sheet
     silver    ocean    · editorial hairline accordion, tap to open
     gold      terracotta · day tabs, one day's chambers at a time
     copper    green    · stacked cards, schedule printed inline

   Every theme renders the same ten fields (see <DoctorMeta> and
   <ScheduleList>) so no data is ever hidden by the design.
   Force one with ?theme=silver while testing.
==================================================================== */

const API = "https://medcoclinics.com/api/clinic/clinicdetails/id";
const CDN = "https://www.medcoclinics.com/storage/category/";
const THEMES = ["platinum", "silver", "gold", "copper"];
/* Kept in JS too, for the favicon tint. */
const THEME_ACCENT = {
  platinum: "#5A4BDB",
  silver: "#1F6FEB",
  gold: "#C2571F",
  copper: "#0E906E",
};

/* ---------- Offline fallback (page never renders empty) ---------- */
const S = (day, a, b) => ({ day, start_time: a, end_time: b });
const D = (id, name, category, degree, shedule, remark = null, experience = "", image = null) => ({
  id, name, category, remark, experience, image,
  degree: degree.map((x) => ({ degree: x })), shedule,
});
const WEEK6 = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const on = (a, b, days = WEEK6) => days.map((d) => S(d, a, b));

const FALLBACK = {
  clinic: {
    id: 5272,
    name: "D D  Health",
    phone: "9674992338",
    shop_phone: "3323538523",
    address: "5, Beleghata Main Rd, Kulia, Beleghata, Kolkata, West Bengal 700010, India",
    latitude: "22.5615328",
    longitude: "88.4070163",
    leaflet_theme: "platinum",
  },
  category: [
    { id: 3, name: "General Physician", image: CDN + "category_c611b561868d241a4f4e00526c3cb74b_doctor_2785482.png" },
    { id: 48, name: "General Medicine", image: CDN + "category_76a47cb9ab84311632ca3f6b3f5ea4ef_specialist.png" },
    { id: 1, name: "Cardiologists", image: CDN + "category_f6a8b206bdbd93677484371500322b51_cardiology.png" },
    { id: 7, name: "Child Specialist", image: CDN + "category_10f9b05f35baa7c6f26c9fe55b27b618_child.jpg" },
    { id: 2, name: "Gynecologist", image: CDN + "category_2493e40fa02f06a980dcd648258c4c2e_gynecology.png" },
    { id: 19, name: "Orthopedic", image: CDN + "category_7cb810b7ef5e5cdbdb226946ab9417c7_orthopedics.png" },
    { id: 8, name: "Dermatologists", image: CDN + "category_319f3ccfcb7579abb94906f0cfcdcb22_dermatology (1).png" },
    { id: 27, name: "ENT", image: CDN + "category_2b9d228235cef493d3b54675355148fe_otology.png" },
    { id: 5, name: "Urologist", image: CDN + "category_06c3069abb8154cda595f45c495c4ef9_urology.png" },
    { id: 46, name: "Dentists", image: CDN + "category_3e78ec18cc52f080dc2700e7b1362a81_oral-helth.png" },
    { id: 58, name: "Chest Specialist", image: CDN + "category_a087913116219792fc60210fa39721a6_pulmonology.png" },
    { id: 36, name: "Physiotherapist", image: CDN }, // broken in the API — falls back to a drawn glyph
  ],
  doctor: [
    D(5273, "Dr. K C Saha", "General Physician", ["MBBS"], on("18.00", "19.00", ["Sunday", ...WEEK6])),
    D(5286, "Dr. J Naik", "Cardiologists", ["MBBS", "M.D", "DM( Cardiology)"], on("09.00", "10.00")),
    D(5290, "Dr. M B Das", "Cardiologists", ["M.S", "MCH"], [S("Sunday", "10:00 AM", "11:00 AM")],
      "by appointment call before visit"),
    D(5282, "Dr. Jayanta Chakraborty", "Child Specialist", ["MBBS", "DCH", "MD"], on("19.00", "20.00")),
    D(5277, "Dr. A Talukdar", "General Medicine", ["MBBS", "MD", "PH.D(USA)"],
      on("5:00 PM", "6:00 PM", ["Monday", "Wednesday", "Friday"])),
    D(5275, "Dr. A B Dey", "General Medicine", ["MBBS", "DipCard(Cal)"],
      [S("Tuesday", "10:00 AM", "11:00 AM"), S("Saturday", "7:00 PM", "8:00 PM")]),
    D(5298, "Dr. Subrata Roy", "Gynecologist", ["MBBS", "DGO", "DRCOG(London)"],
      [S("Monday", "18.00", "19.00"), S("Tuesday", "12.00", "13.00"), S("Wednesday", "18.00", "19.00"),
       S("Thursday", "12.00", "13.00"), S("Friday", "18.00", "19.00"), S("Saturday", "18.00", "19.00"),
       S("Saturday", "12.00", "13.00")]),
    D(5297, "Dr. Chandrima Roy", "Gynecologist", ["MBBS", "DGO", "MD"],
      [...on("11.00", "12.00", ["Monday", "Wednesday", "Friday"]),
       ...on("18.00", "19.00", ["Monday", "Wednesday", "Friday"])]),
    D(5299, "Dr. Jayita Chakrabarti", "Gynecologist", ["MBBS", "M.D", "DNB"],
      on("18.00", "19.00", ["Tuesday", "Thursday", "Saturday"])),
    D(5292, "Dr. Subrata Das", "Orthopedic", ["MS(Ortho)", "D Ortho(Cal)"], on("13.00", "14.00")),
    D(5294, "Dr. Tanmoy Karmakar", "Orthopedic", ["MS(Ortho)"],
      on("19.00", "20.00", ["Monday", "Wednesday", "Friday"])),
    D(5293, "Dr. Sudin Chowdhury", "Orthopedic", ["D Ortho(Cal)", "MS(Ortho)"],
      on("18.00", "19.00", ["Tuesday", "Thursday", "Saturday"])),
    D(5296, "Dr. Arundhati Ghosh", "Dermatologists", ["MBBS"], on("12.00", "13.00", ["Monday", "Friday"])),
    D(5295, "Dr. Hirak Bhattacharya", "Dermatologists", ["MBBS", "DTM&H"], [S("Saturday", "11.00", "12.00")]),
    D(5279, "Dr. S Mukherjee", "ENT", ["MBBS", "MS(ENT)", "WHOFELLOW(UK)"],
      on("5:00 PM", "8:00 PM", ["Monday", "Wednesday", "Saturday"])),
    D(5281, "Dr. M Laskar", "ENT", ["MBBS", "DIOWBHS(Ent)"],
      on("6:00 PM", "7:00 PM", ["Tuesday", "Thursday", "Friday"])),
    D(283, "Dr. Sunirmal Choudhury", "Urologist", ["MBBS", "M.C.H(Urology)", "Aso Professor"],
      [S("Tuesday", "20.30", "21.30")], null, "20 Years 6 Months"),
    D(5291, "Dr. K N Chakraborty", "Dentists", ["BDS"], on("17.00", "18.00", ["Tuesday", "Thursday"])),
    D(5278, "Dr. S Mitra", "Chest Specialist", ["MBBS", "DTCD"],
      on("6:00 PM", "7:00 PM", ["Monday", "Thursday"])),
    D(5316, "Dr. Dipen Dey", "Physiotherapist", [], on("11.00", "12.00")),
    D(5317, "Dr. Surajit Roy", "Physiotherapist", [], on("16.00", "19.00")),
  ],
};

/* ---------- Time handling ---------- */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toMinutes(raw) {
  if (raw == null) return null;
  const m = String(raw).trim().match(/(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const mer = m[3] ? m[3].toLowerCase() : null;
  if (mer === "pm" && h < 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  return h > 23 ? null : h * 60 + min;
}
function clock(mins) {
  if (mins == null) return "";
  const h24 = Math.floor(mins / 60) % 24, m = mins % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}
const tidy = (mins) => clock(mins).replace(":00", "");

function buildSlots(doctors) {
  const out = [];
  (doctors || []).forEach((doc) => {
    (doc.shedule || []).forEach((s) => {
      const dayIndex = DAYS.indexOf(s.day);
      const start = toMinutes(s.start_time_format || s.start_time);
      const end = toMinutes(s.end_time_format || s.end_time);
      if (dayIndex < 0 || start == null || end == null) return;
      if (out.some((o) => o.doc.id === doc.id && o.dayIndex === dayIndex && o.start === start)) return;
      out.push({ doc, dayIndex, start, end });
    });
  });
  return out;
}
function weekRows(doc) {
  return buildSlots([doc])
    .sort((a, b) => (a.dayIndex - b.dayIndex) || (a.start - b.start))
    .map(({ dayIndex, start, end }) => ({ dayIndex, day: DAYS[dayIndex], start, end }));
}
const degreesOf = (doc) => (doc.degree || []).map((d) => d.degree).filter(Boolean);
const monogramOf = (doc) => doc.name.replace(/^Dr\.?\s*/i, "").trim().charAt(0).toUpperCase();
const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

/* Live / next status for one doctor, shared by every theme. */
function statusOf(doc, today, nowMins) {
  const rows = weekRows(doc);
  const todays = rows.filter((r) => r.dayIndex === today);
  const live = todays.find((r) => nowMins >= r.start && nowMins < r.end);
  const next = todays.find((r) => r.start > nowMins);
  return {
    rows, live: !!live,
    text: live ? "Sitting now — walk in"
      : next ? `Here today from ${tidy(next.start)}`
      : todays.length ? "Finished for today"
      : `Sits ${rows.length} day${rows.length === 1 ? "" : "s"} a week`,
    short: live ? "Sitting now"
      : next ? `Today ${tidy(next.start)}`
      : todays.length ? "Done today" : `${rows.length}\u00d7 a week`,
  };
}

/* ================================================================== */
export default function ClinicLeaflet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentId, setCurrentId] = useState(() => new URLSearchParams(window.location.search).get("id"));
  const [now, setNow] = useState(() => new Date());
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState("");
  const [modalDoc, setModalDoc] = useState(null);
  const [dayTab, setDayTab] = useState(null);
  const rosterRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const pathId = new URLSearchParams(window.location.search).get("id");
      if (pathId !== currentId) setCurrentId(pathId);
    }, 100);
    return () => clearInterval(interval);
  }, [currentId]);

  useEffect(() => {
    const id = currentId;
    if (!id) { setLoading(false); setData(null); return; }
    setLoading(true);
    setData(null);
    const ctrl = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, 8000);
    (async () => {
      try {
        const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
          method: "POST", headers: { Accept: "application/json" }, signal: ctrl.signal,
        });
        const json = await res.json();
        setData(json && json.clinic ? json : null);
        clearTimeout(timer);
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError" && !timedOut) return;
        setData(null);
        clearTimeout(timer);
        setLoading(false);
      }
    })();
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [currentId]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 220);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clinic = data?.clinic;
  const doctors = data?.doctor || data?.doctors || data?.Doctor || [];
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const today = now.getDay();

  const theme = useMemo(() => {
    const forced = (new URLSearchParams(window.location.search).get("theme") || "").toLowerCase();
    if (THEMES.includes(forced)) return forced;
    const fromApi = String(clinic?.leaflet_theme || "").trim().toLowerCase();
    return THEMES.includes(fromApi) ? fromApi : "copper";
  }, [clinic]);

  /* ── Favicon: a folded leaflet page, tinted to the theme ── */
  useEffect(() => {
    const c = THEME_ACCENT[theme] || THEME_ACCENT.copper;
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
      `<rect width="64" height="64" rx="14" fill="${c}"/>` +
      `<path d="M20 13h16l10 10v28a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3V16a3 3 0 0 1 3-3z" fill="#fff"/>` +
      `<path d="M36 13l10 10H39a3 3 0 0 1-3-3z" fill="${c}" opacity=".35"/>` +
      `<g fill="${c}"><rect x="23" y="30" width="18" height="3" rx="1.5"/>` +
      `<rect x="23" y="37" width="18" height="3" rx="1.5"/>` +
      `<rect x="23" y="44" width="11" height="3" rx="1.5"/></g></svg>`;
    const href = "data:image/svg+xml," + encodeURIComponent(svg);

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = href;

    let apple = document.querySelector("link[rel='apple-touch-icon']");
    if (!apple) {
      apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      document.head.appendChild(apple);
    }
    apple.href = href;

    let meta = document.querySelector("meta[name='theme-color']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = c;
  }, [theme]);

  useEffect(() => { if (dayTab === null) setDayTab(today); }, [today, dayTab]);

  useEffect(() => {
    const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;
    const marks = buildSlots(doctors)
      .filter((s) => s.dayIndex === now.getDay())
      .flatMap((s) => [s.start * 60000, s.end * 60000])
      .filter((ms) => ms > nowMs)
      .sort((a, b) => a - b);
    const nextMs = marks.length ? marks[0] - nowMs : 86400000 - nowMs;
    const id = setTimeout(() => setNow(new Date()), Math.min(nextMs + 1000, 1800000));
    return () => clearTimeout(id);
  }, [now, doctors]);

  useEffect(() => {
    const onWake = () => { if (!document.hidden) setNow(new Date()); };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    return () => {
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!modalDoc) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setModalDoc(null); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [modalDoc]);

  const visible = (filter === "all" || !filter) ? doctors : doctors.filter((d) => d.category === filter);
  const searched = searchQuery.trim()
    ? visible.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : visible;
  const grouped = useMemo(() => {
    const m = new Map();
    searched.forEach((d) => { if (!m.has(d.category)) m.set(d.category, []); m.get(d.category).push(d); });
    return [...m.entries()];
  }, [searched]);

  const usedCats = useMemo(() => {
    const cats = data?.category || [];
    const imgOf = new Map(cats.map((c) => [c.name, c.image || c.images]));
    const counts = new Map();
    doctors.forEach((d) => counts.set(d.category, (counts.get(d.category) || 0) + 1));
    const known = cats.map((c) => c.name).filter((n) => counts.has(n));
    const extra = [...counts.keys()].filter((n) => !known.includes(n));
    return [...known, ...extra].map((name) => ({ name, count: counts.get(name), image: imgOf.get(name) || null }));
  }, [data, doctors]);
  const imageOf = useMemo(() => new Map(usedCats.map((c) => [c.name, c.image])), [usedCats]);

  const name = (clinic?.name || "").replace(/\s+/g, " ").trim();
  const tel = clinic?.phone || clinic?.shop_phone;
  const shopPhone = clinic?.shop_phone;
  const maps = clinic ? `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}` : "#";
  const liveCount = useMemo(
    () => searched.filter((d) => statusOf(d, today, nowMins).live).length, [searched, today, nowMins]
  );

  useEffect(() => { document.title = name ? `${name} - Clinic Schedule` : "Clinic Schedule"; }, [name]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: name || "Clinic", text: `${name}${clinic?.address ? " — " + clinic.address : ""}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast("Link copied");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      setToast("Could not share — copy the link from the address bar");
    }
  };
  const handleDownload = () => {
    setToast("Choose \u201cSave as PDF\u201d");
    setTimeout(() => window.print(), 350);
  };

  const pickCategory = (c, e) => {
    setFilter(c);
    if (e?.currentTarget?.scrollIntoView) {
      e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    if (rosterRef.current) {
      const y = rosterRef.current.getBoundingClientRect().top + window.scrollY - 62;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className={`dd theme-${theme}`}>
      <style>{CSS}</style>

      <div className={`topbar ${scrolled ? "show" : ""}`}>
        <div className="topbar-in">
          <span className="topbar-name">{name}</span>
          <div className="topbar-acts">
            <button className="topbar-btn" onClick={handleShare} aria-label="Share this page"><Share /> Share</button>
            <button className="topbar-btn" onClick={handleDownload} aria-label="Download as PDF"><Download /> Save</button>
          </div>
        </div>
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}

      <div className="shell">
        {loading && <PageSkeleton />}

        {!loading && clinic && (
          <header className="head">
            <h1 className="clinic-name">{name || "Clinic"}</h1>
            <p className="clinic-address">
              <span className="pin"><MapPin /></span>
              {clinic?.address || "\u00a0"}
            </p>
            {(tel || shopPhone) && (
              <div className="clinic-phones">
                {tel && (
                  <button className="clinic-phone" onClick={() => { navigator.clipboard.writeText(tel); setToast("Number copied"); }}>
                    <span className="phone-icon"><Phone /></span>{tel}
                  </button>
                )}
                {shopPhone && shopPhone !== tel && (
                  <button className="clinic-phone" onClick={() => { navigator.clipboard.writeText(shopPhone); setToast("Number copied"); }}>
                    <span className="phone-icon"><Phone /></span>{shopPhone}
                  </button>
                )}
              </div>
            )}
            {/* {doctors.length > 0 && (
              <p className="head-live">
                <span className={`pip ${liveCount ? "pip--open" : ""}`} />
                {liveCount ? `${liveCount} sitting right now` : "No chamber running right now"}
              </p>
            )} */}
          </header>
        )}

        {!loading && !clinic && (
          <div className="no-id-message">
            <h2>Clinic Not Found</h2>
            <p>No clinic data is available for this link.</p>
          </div>
        )}

        {!loading && clinic && (
          <>
            <section className="find">
              {theme === "gold" ? (
                <div className="g-filter">
                  <label className="g-select">
                    <span>Speciality</span>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                      <option value="all">All specialities ({doctors.length})</option>
                      {usedCats.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
                    </select>
                    <Chevron />
                  </label>
                </div>
              ) : theme === "silver" ? (
                <div className="strip-wrap">
                  <div className="strip s-tabs" role="tablist" aria-label="Specialities">
                    <button role="tab" aria-selected={filter === "all"}
                            className={`s-tab ${filter === "all" ? "on" : ""}`}
                            onClick={(e) => pickCategory("all", e)}>
                      All <span className="mono">{doctors.length}</span>
                    </button>
                    {usedCats.map((c) => (
                      <button key={c.name} role="tab" aria-selected={filter === c.name}
                              className={`s-tab ${filter === c.name ? "on" : ""}`}
                              onClick={(e) => pickCategory(c.name, e)}>
                        {shortCat(c.name)} <span className="mono">{c.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="strip-wrap">
                  <div className="strip" role="tablist" aria-label="Specialities">
                    <button role="tab" aria-selected={filter === "all"}
                            className={`chip ${filter === "all" ? "on" : ""}`}
                            onClick={(e) => pickCategory("all", e)}>
                      <span className="chip-ic"><Glyph name="All" /></span>
                      All<span className="chip-n mono">{doctors.length}</span>
                    </button>
                    {usedCats.map((c) => (
                      <button key={c.name} role="tab" aria-selected={filter === c.name}
                              className={`chip ${filter === c.name ? "on" : ""}`}
                              onClick={(e) => pickCategory(c.name, e)}>
                        <CatIcon name={c.name} src={c.image} size="chip" />
                        {shortCat(c.name)}<span className="chip-n mono">{c.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="search-wrap">
                <span className="search-ic"><SearchIcon /></span>
                <input type="text" placeholder="Search doctor name..." className="search-input"
                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>}
              </div>
            </section>

            <section className="roster" ref={rosterRef}>
              {searched.length === 0 ? (
                <p className="empty">No doctors match this filter.</p>
              ) : theme === "silver" ? (
                <SilverRoster groups={grouped} today={today} nowMins={nowMins} imageOf={imageOf} />
              ) : theme === "gold" ? (
                <GoldRoster doctors={searched} day={dayTab ?? today} setDay={setDayTab}
                            today={today} nowMins={nowMins} imageOf={imageOf} />
              ) : theme === "platinum" ? (
                <PlatinumRoster groups={grouped} today={today} nowMins={nowMins}
                                imageOf={imageOf} onOpen={setModalDoc} />
              ) : (
                <CopperRoster groups={grouped} today={today} nowMins={nowMins} imageOf={imageOf} />
              )}
            </section>

            <section className="visit">
              <h2>Getting here</h2>
              <p className="address">{clinic?.address || "—"}</p>

              <a className="maplink" href={maps} target="_blank" rel="noreferrer">
                <span className="mapthumb" aria-hidden="true"><MapPin /></span>
                <span>
                  <b>Open in Maps</b>
                  <em className="mono">
                    {clinic ? `${Number(clinic.latitude).toFixed(4)}, ${Number(clinic.longitude).toFixed(4)}` : ""}
                  </em>
                </span>
                <Arrow />
              </a>

              <dl className="facts">
                <div><dt className="mono">Reception</dt><dd><a href={`tel:${clinic?.phone || ""}`}>{clinic?.phone || "—"}</a></dd></div>
                <div><dt className="mono">Landline</dt><dd><a href={`tel:${clinic?.shop_phone || ""}`}>{clinic?.shop_phone || "—"}</a></dd></div>
              </dl>

              <p className="note">
                Chamber timings can shift on holidays. If you are travelling far, call first and
                confirm the doctor is sitting.
              </p>
            </section>

            <footer className="foot">
              <span className="mono">{name || "D D Health"}</span>
              <span className="mono dim">medcoclinics.com</span>
            </footer>
          </>
        )}
      </div>

      <div className="fab-bar">
        <a className="fab fab--map" href={maps} target="_blank" rel="noreferrer" aria-label="Directions">
          <span className="fab-ring"><MapPin /></span>
        </a>
        <a className="fab fab--call" href={`tel:${tel || ""}`} aria-label="Call the clinic">
          <span className="fab-ring"><Phone /></span>
        </a>
      </div>

      {modalDoc && (
        <ScheduleSheet doc={modalDoc} today={today} nowMins={nowMins} tel={tel}
                       catImage={imageOf.get(modalDoc.category)} onClose={() => setModalDoc(null)} />
      )}
    </div>
  );
}

/* ==================================================================
   SHARED FIELD RENDERERS
   Every theme composes these, so all ten fields always appear:
   name · category · degrees · hospital · experience ·
   additionalText_1 (bold) · additionalText_2 · timings ·
   remark · live/soon status.
==================================================================== */
function DoctorMeta({ doc, catImage, withCategory = true }) {
  const deg = degreesOf(doc);
  return (
    <>
      {withCategory && (
        <p className="m-cat"><CatIcon name={doc.category} src={catImage} size="xs" />{doc.category}</p>
      )}
      {deg.length > 0 && <p className="m-deg">{deg.join(" · ")}</p>}
      {doc.hospital_name && <p className="m-hosp">{doc.hospital_name}</p>}
      {doc.experience ? <p className="m-exp">{doc.experience} in practice</p> : null}
      {doc.additionalText_1 && <p className="m-a1">{doc.additionalText_1}</p>}
      {doc.additionalText_2 && <p className="m-a2">{doc.additionalText_2}</p>}
    </>
  );
}

function ScheduleList({ rows, today, nowMins, label = "Chamber timings", className = "" }) {
  return (
    <div className={`sched ${className}`}>
      <p className="sched-h">{label}</p>
      <ul>
        {rows.map((r, i) => {
          const isToday = r.dayIndex === today;
          const live = isToday && nowMins >= r.start && nowMins < r.end;
          return (
            <li key={i} className={`${isToday ? "row-today" : ""} ${live ? "row-live" : ""}`}>
              <span className="day">{r.day}</span>
              <i className="leader" />
              <span className="time mono">{clock(r.start)} – {clock(r.end)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const Remark = ({ doc }) => (doc.remark ? <p className="m-remark">{cap(doc.remark)}</p> : null);
const StatusLine = ({ st }) => <p className={`m-status ${st.live ? "is-live" : ""}`}>{st.text}</p>;

/* ==================================================================
   COPPER — stacked cards, schedule inline
==================================================================== */
function CopperRoster({ groups, today, nowMins, imageOf }) {
  return (
    <>
      {groups.map(([cat, docs]) => (
        <div className="group" key={cat}>
          <h3 className="group-title">
            <CatIcon name={cat} src={imageOf.get(cat)} size="xs" /><span>{cat}</span><i className="gline" />
          </h3>
          {docs.map((doc, i) => {
            const st = statusOf(doc, today, nowMins);
            return (
              <article className={`card ${st.live ? "card--live" : ""}`} key={doc.id}
                       style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}>
                <div className="card-top">
                  <Avatar doc={doc} className="photo" />
                  <div className="card-id">
                    <h4>{doc.name}</h4>
                    <DoctorMeta doc={doc} catImage={imageOf.get(doc.category)} />
                  </div>
                  {st.live && <span className="tag-live">Now</span>}
                </div>
                <ScheduleList rows={st.rows} today={today} nowMins={nowMins} />
                <Remark doc={doc} />
                <StatusLine st={st} />
              </article>
            );
          })}
        </div>
      ))}
    </>
  );
}

/* ==================================================================
   SILVER — tinted band per doctor, white card overlapping with the
   avatar breaking its top edge, Schedule reveals the timings inline
==================================================================== */
function SilverRoster({ groups, today, nowMins, imageOf }) {
  const [open, setOpen] = useState(null);
  let n = 0; // alternates the band tone down the page

  return (
    <>
      {groups.map(([cat, docs]) => (
        <div className="s2-group" key={cat}>
          {docs.map((doc) => {
            const st = statusOf(doc, today, nowMins);
            const isOpen = open === doc.id;
            const tone = n++ % 2 === 0 ? "s2-a" : "s2-b";
            const deg = degreesOf(doc);

            return (
              <article className={`s2-block ${tone} ${st.live ? "is-live" : ""}`} key={doc.id}>
                <div className="s2-hd">
                  <h4 className="s2-name">{doc.name}</h4>
                  {st.live && <span className="s2-live">Sitting now</span>}
                </div>
                <p className="s2-cat">
                  <CatIcon name={doc.category} src={imageOf.get(doc.category)} size="xs" />
                  {doc.category}
                </p>

                <div className="s2-card">
                  {doc.experience ? <span className="s2-exp">{doc.experience}</span> : null}

                  <div className="s2-top">
                    <Avatar doc={doc} className="s2-photo" />
                    <div className="s2-lead">
                      {deg.length > 0 && <p className="s2-deg">{deg.join(" · ")}</p>}
                      {doc.additionalText_1 && <p className="s2-a1">{doc.additionalText_1}</p>}
                    </div>
                  </div>

                  {doc.hospital_name && <p className="s2-hosp">{doc.hospital_name}</p>}
                  {doc.additionalText_2 && <p className="s2-a2">{doc.additionalText_2}</p>}
                  <Remark doc={doc} />

                  <div className="s2-panel" hidden={!isOpen}>
                    <ScheduleList rows={st.rows} today={today} nowMins={nowMins} />
                    <StatusLine st={st} />
                  </div>

                  <div className="s2-foot">
                    <span className={`s2-status ${st.live ? "is-live" : ""}`}>{st.short}</span>
                    <button className="s2-sched" onClick={() => setOpen(isOpen ? null : doc.id)}
                            aria-expanded={isOpen}>
                      {isOpen ? "Hide schedule" : "Schedule"}
                      <span className="s2-chev"><Chevron /></span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ))}
    </>
  );
}

/* ==================================================================
   GOLD — day tabs; each entry still carries the full record
==================================================================== */
function GoldRoster({ doctors, day, setDay, today, nowMins, imageOf }) {
  const all = useMemo(() => buildSlots(doctors), [doctors]);
  const counts = useMemo(() => {
    const c = new Array(7).fill(0);
    all.forEach((s) => { c[s.dayIndex] += 1; });
    return c;
  }, [all]);
  const slots = useMemo(
    () => all.filter((s) => s.dayIndex === day).sort((a, b) => a.start - b.start), [all, day]
  );

  return (
    <div className="g-wrap">
      <div className="g-days" role="tablist" aria-label="Day of the week">
        {DAY3.map((d, i) => (
          <button key={i} role="tab" aria-selected={day === i} disabled={!counts[i]}
                  className={`g-day ${day === i ? "on" : ""} ${i === today ? "is-today" : ""}`}
                  onClick={() => setDay(i)}>
            <span className="g-day-l">{d}</span>
            <span className="g-day-n mono">{counts[i] || "–"}</span>
          </button>
        ))}
      </div>

      <p className="g-caption">
        {day === today ? "Today" : DAYS[day]} · {slots.length || "no"} chamber{slots.length === 1 ? "" : "s"}
      </p>

      {slots.length === 0 ? (
        <p className="empty">Nothing scheduled on {DAYS[day]}.</p>
      ) : (
        <ol className="g-list">
          {slots.map((s, i) => {
            const st = statusOf(s.doc, today, nowMins);
            const live = day === today && nowMins >= s.start && nowMins < s.end;
            const past = day === today && nowMins >= s.end;
            return (
              <li key={`${s.doc.id}-${s.start}`}
                  className={`g-item ${live ? "is-live" : ""} ${past ? "is-past" : ""}`}
                  style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                <div className="g-body">
                  <div className="g-head">
                    <Avatar doc={s.doc} className="g-photo" />
                    <div className="g-id">
                      <h4>{s.doc.name}</h4>
                      <DoctorMeta doc={s.doc} catImage={imageOf.get(s.doc.category)} />
                    </div>
                    {live && <span className="g-live">Now</span>}
                  </div>
                  <ScheduleList rows={st.rows} today={today} nowMins={nowMins} label="All chamber timings" />
                  <Remark doc={s.doc} />
                  <StatusLine st={st} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/* ==================================================================
   PLATINUM — premium cards carrying every field except the week
   grid, which opens in a bottom sheet
==================================================================== */
function PlatinumRoster({ groups, today, nowMins, imageOf, onOpen }) {
  return (
    <>
      {groups.map(([cat, docs]) => (
        <div className="p-group" key={cat}>
          <h3 className="p-gtitle">
            <CatIcon name={cat} src={imageOf.get(cat)} size="xs" />
            <span>{cat}</span>
          </h3>

          {docs.map((doc, i) => {
            const st = statusOf(doc, today, nowMins);
            return (
              <article className={`p-card ${st.live ? "is-live" : ""}`} key={doc.id}
                       style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}>
                <span className="p-rail" aria-hidden="true" />
                <div className="p-top">
                  <Avatar doc={doc} className="p-photo" />
                  <div className="p-id">
                    <h4>{doc.name}</h4>
                    {/* <DoctorMeta doc={doc} catImage={imageOf.get(doc.category)} /> */}
                  </div>
                  {st.live && <span className="p-badge">Now</span>}
                </div>

                <Remark doc={doc} />

                <div className="p-foot">
                  <StatusLine st={st} />
                  <button className="p-btn" onClick={() => onOpen(doc)}>
                    <CalendarIcon /> Chamber timings
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ))}
    </>
  );
}

function ScheduleSheet({ doc, today, nowMins, tel, catImage, onClose }) {
  const st = statusOf(doc, today, nowMins);
  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label={`${doc.name} schedule`}>
      <div className="sheet-bd" onClick={onClose} />
      <div className="sheet">
        <button className="sheet-grab" onClick={onClose} aria-label="Close" />
        <div className="sheet-head">
          <Avatar doc={doc} className="sheet-photo" />
          <div className="p-id">
            <h3>{doc.name}</h3>
            <DoctorMeta doc={doc} catImage={catImage} />
          </div>
          {st.live && <span className="p-badge">Now</span>}
        </div>

        <ScheduleList rows={st.rows} today={today} nowMins={nowMins} />
        <Remark doc={doc} />
        <StatusLine st={st} />

        <div className="sheet-acts">
          <button className="sheet-close" onClick={onClose}>Close</button>
          <a className="sheet-call" href={`tel:${tel || ""}`}><Phone /> Call clinic</a>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   Shared bits
==================================================================== */
function Avatar({ doc, className }) {
  const src = doc.image || doc.images || doc.photo || doc.avatar;
  const generic = !src || /avatar-1\.png$/i.test(String(src));
  const [failed, setFailed] = useState(false);
  if (generic || failed) {
    return <span className={`${className} is-mono mono`} aria-hidden="true">{monogramOf(doc)}</span>;
  }
  return <img className={className} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

function CatIcon({ name, src, size }) {
  const [failed, setFailed] = useState(false);
  const hasSrc = typeof src === "string" && src.trim().length > 0 && /\.(png|jpe?g|webp|svg)$/i.test(src.trim());
  return (
    <span className={size ? `cat-ic cat-ic--${size}` : "cat-ic"}>
      {failed || !hasSrc ? <Glyph name={name} /> : <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />}
    </span>
  );
}

function shortCat(name) {
  const map = {
    "General Physician": "Physician", "General Medicine": "Medicine",
    "Child Specialist": "Child", "Chest Specialist": "Chest",
    Physiotherapist: "Physio", Dermatologists: "Skin",
    Cardiologists: "Heart", Orthopedic: "Ortho", Gynecologist: "Gynae",
  };
  return map[name] || name;
}

function PageSkeleton() {
  return (
    <div className="sk" aria-busy="true" aria-label="Loading clinic details">
      <div className="sk-head">
        <span className="sk-b sk-title" />
        <span className="sk-b sk-addr" />
        <div className="sk-phones"><span className="sk-b sk-phone" /><span className="sk-b sk-phone" /></div>
      </div>
      <div className="sk-strip">
        {[92, 116, 84, 104, 96, 88].map((w, i) => <span key={i} className="sk-b sk-chip" style={{ width: w }} />)}
      </div>
      <div className="sk-search"><span className="sk-b sk-field" /></div>
      <div className="sk-roster">
        {[0, 1, 2].map((g) => (
          <div className="sk-group" key={g}>
            <div className="sk-grouphead">
              <span className="sk-b sk-dot" /><span className="sk-b sk-gtitle" /><i className="sk-gline" />
            </div>
            <div className="sk-card">
              <div className="sk-cardtop">
                <span className="sk-b sk-avatar" />
                <div className="sk-lines">
                  <span className="sk-b sk-l1" /><span className="sk-b sk-l2" /><span className="sk-b sk-l3" />
                </div>
              </div>
              <div className="sk-sched">
                <span className="sk-b sk-schedh" />
                {[0, 1, 2].map((r) => (
                  <div className="sk-row" key={r}>
                    <span className="sk-b sk-day" /><i className="sk-leader" /><span className="sk-b sk-time" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- icons ---------- */
const Phone = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  </svg>
);
const MapPin = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const Arrow = () => (
  <svg className="arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);
const Chevron = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
);
const Share = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);
const Download = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
const PATHS = {
  All: "M4 12h4l2-5 3 10 2-5h5",
  "General Physician": "M6 3v6a5 5 0 0 0 10 0V3M11 14v2a4 4 0 0 0 8 0v-2M19 10a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z",
  "General Medicine": "M10.5 3.5 3.5 10.5a4.95 4.95 0 0 0 7 7l7-7a4.95 4.95 0 0 0-7-7ZM7 7l7 7",
  Cardiologists: "M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1Z",
  "Child Specialist": "M12 3a6 6 0 0 1 6 6v1a6 6 0 0 1-12 0V9a6 6 0 0 1 6-6ZM9.5 9.5h.01M14.5 9.5h.01M9.8 13a3 3 0 0 0 4.4 0M6 6 4 4M18 6l2-2",
  Gynecologist: "M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 13v8M9 18h6",
  Orthopedic: "M7.5 4a2.5 2.5 0 0 0-2 4 2.5 2.5 0 0 0 .6 4.4l5.4 5.4A2.5 2.5 0 0 0 16 20a2.5 2.5 0 0 0 2-4 2.5 2.5 0 0 0-.6-4.4L12 6.2A2.5 2.5 0 0 0 7.5 4Z",
  Dermatologists: "M12 3a6 6 0 0 0-6 6c0 3 1.5 4.5 1.5 7A4.5 4.5 0 0 0 12 21a4.5 4.5 0 0 0 4.5-5c0-2.5 1.5-4 1.5-7a6 6 0 0 0-6-6ZM9.5 11h.01M13.5 9.5h.01M11 14.5h.01M14.5 13.5h.01",
  ENT: "M8 20a3 3 0 0 1-3-3V9a7 7 0 0 1 14 0c0 3-2 4-3.5 5S13 16 13 18a2.5 2.5 0 0 1-5 2ZM9 9a3 3 0 0 1 5.5-1.7",
  Urologist: "M9 4c3 0 4 2 4 4s2 3 4 3a4 4 0 0 1 0 8c-4 0-6-3-6-6s-1-4-3-4a3 3 0 0 1 1-5Z",
  Dentists: "M8 3c-2.5 0-4 2-4 5 0 4 1.5 6 2 10 .3 2.5 2.5 2.5 2.8 0 .3-2.5.5-4 1.2-4s.9 1.5 1.2 4c.3 2.5 2.5 2.5 2.8 0 .5-4 2-6 2-10 0-3-1.5-5-4-5-1.5 0-2 .8-4 .8S9.5 3 8 3Z",
  "Chest Specialist": "M12 3v9M8.5 7c-2 0-3.5 1.5-3.5 4 0 3-1 5-1 7a2 2 0 0 0 4 .5c.5-2 2-3.5 2-6.5V9c0-1.2-.6-2-1.5-2ZM15.5 7c2 0 3.5 1.5 3.5 4 0 3 1 5 1 7a2 2 0 0 1-4 .5c-.5-2-2-3.5-2-6.5V9c0-1.2.6-2 1.5-2Z",
  Physiotherapist: "M13 3.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM11 8l-3 3 2 3 1 6M14 9l3 2 2 4M10 14l-4 2",
};
const Glyph = ({ name }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={PATHS[name] || PATHS.All} />
  </svg>
);

/* ================================================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&family=DM+Mono:wght@400;500&display=swap');

body{margin:0;padding:0;}

/* ═════════ PALETTES — names are tiers, colours are chosen to look
   good. Richest treatment on the highest tier. ═════════ */
.dd{
  /* copper — green */
  --accent:#0A7C7A; --accent-2:#0E906E; --tint:#E6F5F4;
  --live:#E8553D; --live-soft:#FDEDE9;
  --page:#F6FAF9; --card:#FFFFFF;
  --ink:#12262B; --muted:#63808A; --rule:#E2EAEB; --skel:#E1E8E9;
  --head-bg:#0E906E; --head-ink:#FFFFFF;
  --body:'Instrument Sans',system-ui,-apple-system,sans-serif;
  --display:'Instrument Sans',system-ui,sans-serif;
  --mono:'DM Mono',ui-monospace,monospace;
  background:#E9EFEE; font-family:var(--body); color:var(--ink);
  -webkit-font-smoothing:antialiased; min-height:100%;
}
/* platinum — violet, the flagship */
.dd.theme-platinum{
  --accent:#5A4BDB; --accent-2:#3F32B4; --tint:#EFEDFD;
  --live:#F2543D; --live-soft:#FEEDE9;
  --page:#FFFFFF; --ink:#15142E; --muted:#6D6A90; --rule:#E8E6F6; --skel:#EFEDF9;
  --head-bg:#FFFFFF; --head-ink:#15142E;
  background:#EDEBF7;
}
/* silver — ocean blue */
.dd.theme-silver{
  --accent:#1F6FEB; --accent-2:#1552B4; --tint:#E9F1FE;
  --live:#EF6C2E; --live-soft:#FDEFE6;
  --page:#FFFFFF; --ink:#101A28; --muted:#6C7E95; --rule:#E4EAF2; --skel:#EDF1F7;
  --head-bg:#FFFFFF; --head-ink:#101A28;
  background:#EAEFF6;
}
/* gold — terracotta with a teal live accent */
.dd.theme-gold{
  --accent:#C2571F; --accent-2:#96410F; --tint:#FCEEE4;
  --live:#0E8C7F; --live-soft:#E2F4F1;
  --page:#FFFFFF; --ink:#26190F; --muted:#8B7461; --rule:#EFE3D8; --skel:#F4EAE0;
  --head-bg:#FFFFFF; --head-ink:#26190F;
  --display:'Fraunces',Georgia,serif;
  background:#F2E9E1;
}

.dd *,.dd *::before,.dd *::after{box-sizing:border-box;}
.dd h1,.dd h2,.dd h3,.dd h4,.dd p,.dd ul,.dd ol,.dd dl,.dd dd{margin:0;padding:0;}
.dd ul,.dd ol{list-style:none;}
.dd a{color:inherit;text-decoration:none;}
.dd button{font:inherit;background:none;border:none;color:inherit;}
.dd .mono{font-family:var(--mono);font-feature-settings:"tnum";}
.dd :focus-visible{outline:2.5px solid var(--accent);outline-offset:3px;border-radius:6px;}

.shell{max-width:480px;margin:0 auto;background:var(--page);min-height:100vh;
  box-shadow:0 0 0 1px rgba(18,38,43,.06);}

/* ---------- topbar ---------- */
.topbar{position:fixed;top:0;left:0;right:0;z-index:30;transform:translateY(-100%);
  transition:transform .3s cubic-bezier(.3,.8,.3,1);pointer-events:none;}
.topbar.show{transform:none;pointer-events:auto;}
.topbar-in{max-width:480px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;
  gap:12px;padding:10px 14px;background:var(--accent-2);color:#fff;}
.topbar-name{font-size:15px;font-weight:700;letter-spacing:-.01em;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.topbar-acts{display:flex;gap:8px;flex:0 0 auto;}
.topbar-btn{display:inline-flex;align-items:center;gap:6px;font-size:12.5px !important;font-weight:600 !important;
  background:rgba(255,255,255,.16) !important;color:#fff !important;border:1px solid rgba(255,255,255,.28) !important;
  padding:7px 12px;border-radius:100px;cursor:pointer;transition:background .18s,transform .15s;}
.topbar-btn:active{transform:scale(.95);}
.theme-platinum .topbar-in,.theme-silver .topbar-in,.theme-gold .topbar-in{
  background:rgba(255,255,255,.96);backdrop-filter:blur(12px);color:var(--ink);
  border-bottom:1px solid var(--rule);}
.theme-platinum .topbar-btn,.theme-silver .topbar-btn,.theme-gold .topbar-btn{
  background:var(--tint) !important;color:var(--accent) !important;border-color:transparent !important;}

/* ---------- toast ---------- */
.toast{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:60;
  background:var(--ink);color:#fff;font-size:12.5px;font-weight:600;
  padding:10px 16px;border-radius:100px;box-shadow:0 10px 24px -10px rgba(0,0,0,.5);
  animation:toastIn .25s cubic-bezier(.2,.75,.3,1) both;max-width:88vw;text-align:center;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-8px);}
                   to{opacity:1;transform:translateX(-50%) translateY(0);}}

/* ---------- header ---------- */
.head{background:var(--head-bg);color:var(--head-ink);padding:34px 22px 30px;text-align:center;}
.head-kicker{display:inline-block;font-family:var(--mono);font-size:10px;letter-spacing:.22em;
  text-transform:uppercase;color:var(--accent);margin-bottom:10px !important;}
.clinic-name{font-family:var(--display);font-size:29px;font-weight:700;letter-spacing:-.025em;line-height:1.15;}
.clinic-address{display:flex;gap:9px;align-items:center;justify-content:center;
  margin-top:13px;font-size:13.5px;line-height:1.55;}
.pin{flex:0 0 auto;opacity:.85;}
.clinic-phones{display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap;}
.clinic-phone{display:inline-flex;gap:8px;align-items:center;font-size:13px;font-weight:600;
  cursor:pointer;padding:7px 13px;border-radius:100px;
  background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.26);}
.head-live{display:inline-flex;align-items:center;gap:8px;margin-top:16px;font-size:12.5px;font-weight:600;opacity:.92;}
.pip{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.5;}
.pip--open{background:var(--live);opacity:1;animation:pulse 2s infinite;}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,0,0,.3);}70%{box-shadow:0 0 0 8px rgba(0,0,0,0);}100%{box-shadow:0 0 0 0 rgba(0,0,0,0);}}

.theme-platinum .head,.theme-silver .head,.theme-gold .head{border-bottom:1px solid var(--rule);}
.theme-platinum .clinic-phone,.theme-silver .clinic-phone,.theme-gold .clinic-phone{
  background:var(--tint);border-color:transparent;color:var(--accent);}
.theme-platinum .clinic-address,.theme-silver .clinic-address,.theme-gold .clinic-address{color:var(--muted);}
.theme-platinum .head{background:linear-gradient(180deg,var(--tint),#fff 78%);}
.theme-platinum .clinic-name{font-size:31px;}
.theme-silver .head{text-align:left;padding:36px 22px 26px;}
.theme-silver .clinic-address,.theme-silver .clinic-phones,.theme-silver .head-live{justify-content:flex-start;}
.theme-silver .clinic-name{font-size:32px;letter-spacing:-.035em;}
.theme-gold .clinic-name{font-size:34px;letter-spacing:-.01em;line-height:1.08;}
.head-rule{display:block;width:54px;height:2px;margin:16px auto 0;
  background:linear-gradient(90deg,transparent,var(--accent),transparent);}

/* ---------- not found ---------- */
.no-id-message{text-align:center;padding:60px 22px;}
.no-id-message h2{font-size:24px;font-weight:700;margin-bottom:12px !important;}
.no-id-message p{font-size:14px;color:var(--muted);line-height:1.6;}

/* ---------- skeleton ---------- */
.sk-b{display:block;border-radius:8px;position:relative;overflow:hidden;background:var(--skel);}
.sk-b::after{content:"";position:absolute;inset:0;transform:translateX(-100%);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent);
  animation:sweep 1.5s infinite;}
@keyframes sweep{100%{transform:translateX(100%);}}
.sk-head{background:var(--head-bg);padding:34px 22px 30px;display:flex;flex-direction:column;
  align-items:center;border-bottom:1px solid var(--rule);}
.theme-copper .sk-head{border-bottom:none;}
.theme-copper .sk-head .sk-b{background:rgba(255,255,255,.22);}
.sk-title{width:62%;height:29px;border-radius:9px;}
.sk-addr{width:86%;height:15px;margin-top:15px;}
.sk-phones{display:flex;gap:14px;margin-top:15px;}
.sk-phone{width:104px;height:15px;}
.sk-strip{display:flex;gap:7px;padding:16px 22px 14px;overflow:hidden;}
.sk-chip{height:38px;border-radius:100px;flex:0 0 auto;}
.sk-search{padding:0 22px;}
.sk-field{width:100%;height:41px;border-radius:12px;}
.sk-roster{padding:20px 16px 30px;}
.sk-group{margin-bottom:22px !important;}
.sk-grouphead{display:flex;align-items:center;gap:8px;margin:0 6px 11px;}
.sk-dot{width:16px;height:16px;border-radius:50%;flex:0 0 auto;}
.sk-gtitle{width:104px;height:11px;border-radius:4px;flex:0 0 auto;}
.sk-gline{flex:1;height:1px;background:var(--rule);}
.sk-card{background:var(--card);border:1px solid var(--rule);padding:12px;border-radius:14px;}
.sk-cardtop{display:flex;gap:13px;align-items:flex-start;}
.sk-avatar{width:52px;height:52px;border-radius:15px;flex:0 0 auto;}
.sk-lines{flex:1;min-width:0;padding-top:2px;}
.sk-l1{width:64%;height:18px;border-radius:6px;}
.sk-l2{width:44%;height:12px;margin-top:9px;}
.sk-l3{width:78%;height:12px;margin-top:8px;}
.sk-sched{margin-top:16px;padding-top:14px;border-top:1px solid var(--rule);}
.sk-schedh{width:96px;height:10px;border-radius:4px;margin-bottom:12px !important;}
.sk-row{display:flex;align-items:center;gap:9px;margin-top:11px;}
.sk-day{width:74px;height:12px;flex:0 0 auto;}
.sk-leader{flex:1;height:1px;border-bottom:1px dotted var(--rule);}
.sk-time{width:112px;height:12px;flex:0 0 auto;}

/* ---------- filters ---------- */
.find{padding:16px 0 6px;}
.strip-wrap{position:relative;}
.strip-wrap::after{content:"";position:absolute;top:0;bottom:0;right:0;width:26px;pointer-events:none;
  background:linear-gradient(90deg,rgba(255,255,255,0),var(--page));}
.strip{display:flex;gap:7px;overflow-x:auto;padding:2px 22px 16px;scrollbar-width:none;}
.strip::-webkit-scrollbar{display:none;}
.chip{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 13px 0 9px;
  border-radius:100px;border:1px solid var(--rule);background:var(--card);
  font-size:13px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;cursor:pointer;
  transition:background .18s,color .18s,border-color .18s,transform .15s;}
.chip:active{transform:scale(.96);}
.chip-ic,.cat-ic--chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;
  background:var(--tint);color:var(--accent);flex:0 0 auto;overflow:hidden;}
.cat-ic--chip img{width:15px;height:15px;object-fit:contain;}
.chip-n{font-size:11px;color:var(--muted);}
.chip.on{background:var(--accent);border-color:var(--accent);color:#fff;}
.chip.on .chip-ic,.chip.on .cat-ic--chip{background:rgba(255,255,255,.2);color:#fff;}
.chip.on .cat-ic--chip img{filter:brightness(0) invert(1);}
.chip.on .chip-n{color:rgba(255,255,255,.75);}
.theme-platinum .chip{border-radius:12px;height:40px;background:var(--tint);border-color:transparent;}
.theme-platinum .chip .chip-ic,.theme-platinum .chip .cat-ic--chip{background:#fff;}
.theme-platinum .chip.on{background:var(--accent-2);}

.s-tabs{gap:18px;padding-bottom:0;border-bottom:1px solid var(--rule);margin:0 0 4px;}
.s-tab{flex:0 0 auto;padding:0 0 12px;font-size:13.5px !important;font-weight:600 !important;color:var(--muted);
  cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent !important;margin-bottom:-1px;
  transition:color .18s,border-color .18s;}
.s-tab span{font-size:11px;opacity:.7;}
.s-tab.on{color:var(--accent) !important;border-bottom-color:var(--accent) !important;}
.s-tabs .s-tab:first-child{margin-left:22px;}
.s-tabs .s-tab:last-child{margin-right:22px;}

.g-filter{padding:0 22px 14px;}
.g-select{position:relative;display:block;}
.g-select span{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--accent);margin-bottom:7px !important;}
.g-select select{width:100%;appearance:none;font:inherit;font-size:14px;font-weight:600;
  padding:12px 38px 12px 14px;border:1px solid var(--rule);border-radius:12px;
  background:var(--card);color:var(--ink);cursor:pointer;}
.g-select svg{position:absolute;right:14px;bottom:14px;color:var(--accent);pointer-events:none;}

.search-wrap{position:relative;padding:0 22px;}
.search-ic{position:absolute;left:36px;top:50%;transform:translateY(-50%);color:var(--muted);
  display:grid;place-items:center;pointer-events:none;}
.search-input{width:100%;padding:11px 40px;font-size:13.5px;
  border:1px solid var(--rule);border-radius:12px;background:var(--card);
  color:var(--ink);outline:none;transition:border-color .2s;}
.search-input:focus{border-color:var(--accent);}
.search-input::placeholder{color:var(--muted);}
.search-clear{position:absolute;right:32px;top:50%;transform:translateY(-50%);
  width:24px;height:24px;color:var(--muted);font-size:15px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;border-radius:50%;}

/* ---------- roster shell ---------- */
.roster{padding:18px 16px 30px;}
.empty{padding:24px 6px;font-size:13.5px;color:var(--muted);line-height:1.6;text-align:center;}
.cat-ic{display:inline-grid;place-items:center;}
.cat-ic img{display:block;object-fit:contain;}
.cat-ic--xs{width:16px;height:16px;} .cat-ic--xs img{width:15px;height:15px;}

/* ═══ SHARED FIELD BLOCKS — used by all four themes ═══ */
.m-cat{display:flex;align-items:center;gap:6px;margin-top:6px !important;font-size:12.5px;
  font-weight:600;color:var(--accent);}
.m-deg{font-size:13px;margin-top:6px !important;line-height:1.5;font-weight:700;}
.m-hosp{margin-top:8px !important;font-size:13px !important;font-weight:600 !important;line-height:1.45;}
.m-exp{margin-top:5px !important;font-size:11px !important;font-weight:600 !important;color:var(--accent);font-family:var(--mono);}
.m-a1{margin-top:8px !important;font-size:12.5px !important;font-weight:700 !important;line-height:1.45;}
.m-a2{margin-top:5px !important;font-size:12.5px !important;color:var(--muted) !important;line-height:1.45;}
.m-remark{margin-top:14px !important;font-size:12.5px !important;color:var(--accent) !important;line-height:1.5 !important;padding:9px 11px !important;
  background:var(--tint) !important;border-radius:10px !important;font-weight:500 !important;}
.m-status{margin-top:12px !important;font-size:12.5px !important;font-weight:600 !important;color:var(--muted) !important;
  animation:tagIn .35s cubic-bezier(.2,.75,.3,1) both;}
.m-status.is-live{color:var(--live);}
@keyframes tagIn{from{opacity:0;transform:scale(.9);}to{opacity:1;transform:none;}}

.sched{margin-top:16px;padding-top:14px;border-top:1px solid var(--rule);}
.sched-h{font-size:10.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
  color:var(--muted);margin-bottom:10px !important;}
.sched ul{display:flex;flex-direction:column;gap:9px;}
.sched li{display:flex;align-items:baseline;gap:9px;font-size:13.5px;}
.day{font-weight:500;white-space:nowrap;transition:color .5s ease;}
.leader{flex:1;height:1px;border-bottom:1px dotted var(--rule);transform:translateY(-3px);}
.time{white-space:nowrap;font-size:12.5px;transition:color .5s ease;}
.row-today .day,.row-today .time{color:var(--accent);font-weight:700;}
.row-live .day,.row-live .time{color:var(--live);font-weight:700;}

/* ═══════════ COPPER ═══════════ */
.group{margin-bottom:22px !important;}
.group-title{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;
  letter-spacing:.13em;text-transform:uppercase;color:var(--accent);margin:0 6px 11px;}
.gline{flex:1;height:1px;background:var(--rule);}
.card{position:relative;background:var(--card);border:1px solid var(--rule);border-radius:14px;
  padding:14px;margin-bottom:12px !important;
  box-shadow:0 1px 2px rgba(18,38,43,.04),0 12px 24px -22px rgba(18,38,43,.4);
  animation:cardIn .5s cubic-bezier(.2,.75,.3,1) both;
  transition:border-color .5s ease,box-shadow .5s ease;}
@keyframes cardIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
.card--live{border-color:var(--live);box-shadow:0 0 0 3px var(--live-soft);}
.card-top{display:flex;gap:13px;align-items:flex-start;}
.photo{flex:0 0 auto;width:52px;height:52px;border-radius:15px;object-fit:cover;display:block;}
.photo.is-mono{display:grid;place-items:center;font-size:19px;color:#fff;background:var(--accent);}
.card-id{flex:1;min-width:0;}
.card-id h4{font-size:19px;font-weight:700;letter-spacing:-.025em;line-height:1.2;}
.tag-live{flex:0 0 auto;font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  background:var(--live);color:#fff;padding:4px 9px;border-radius:100px;
  animation:tagIn .35s cubic-bezier(.2,.75,.3,1) both;}

/* ═══════════ SILVER — tinted bands ═══════════ */
.s2-group{margin:0;}
.s2-block{position:relative;margin:0 -16px;padding:24px 22px 28px;
  animation:cardIn .5s cubic-bezier(.2,.75,.3,1) both;background:var(--s2-bg);}
/* two tones alternate down the page for rhythm */
.s2-a{--s2-bg:#bbd4ee;--s2-ink:#123E8C;--s2-deep:#14306B;}
.s2-b{--s2-bg:#c9fdee;--s2-ink:#0C6A5D;--s2-deep:#0A4941;}
.s2-block.is-live{--s2-bg:#FDF0E8;--s2-ink:#B0450F;--s2-deep:#8A360B;}

.s2-hd{display:flex;align-items:flex-start;gap:10px;}
.s2-name{flex:1;min-width:0;font-size:27px;font-weight:800;line-height:1.16;
  letter-spacing:-.03em;color:var(--s2-ink);}
.s2-live{flex:0 0 auto;margin-top:5px;font-size:9.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;background:var(--live);color:#fff;padding:5px 10px;border-radius:100px;
  box-shadow:0 4px 12px -6px var(--live);animation:tagIn .35s cubic-bezier(.2,.75,.3,1) both;}
.s2-cat{display:flex;align-items:center;gap:7px;margin-top:6px !important;
  font-size:15px;font-weight:600;color:var(--s2-ink);opacity:.82;}

.s2-card{position:relative;background:#fff;border-radius:16px;margin-top:48px;
  padding:0 17px 16px;box-shadow:0 3px 10px -4px rgba(0,0,0,.1),0 18px 34px -26px rgba(0,0,0,.45);}
/* experience badge sits on the band, card tucks under it */
.s2-exp{position:absolute;right:0;top:-38px;background:var(--s2-deep);color:#fff;
  font-size:13.5px;font-weight:700;letter-spacing:-.01em;padding:11px 18px;
  border-radius:10px 10px 0 0;white-space:nowrap;max-width:70%;overflow:hidden;text-overflow:ellipsis;}

.s2-top{display:flex;gap:15px;align-items:flex-start;}
/* avatar rises out of the card's top-left corner */
.s2-photo{flex:0 0 auto;width:86px;height:86px;border-radius:50%;object-fit:cover;display:block;
  margin-top:-42px;background:#fff;box-shadow:0 0 0 5px #fff,0 7px 18px -9px rgba(0,0,0,.45);}
.s2-photo.is-mono{display:grid;place-items:center;font-size:32px;font-weight:500;color:#fff;
  background:var(--s2-deep);}
.s2-lead{flex:1;min-width:0;padding-top:18px;}
.s2-deg{font-size:19px;font-weight:700;letter-spacing:-.02em;line-height:1.25;color:var(--ink);}
.s2-a1{margin-top:8px !important;font-size:14.5px;font-weight:600;line-height:1.45;color:var(--s2-ink);}

.s2-hosp{margin-top:14px !important;font-size:16.5px;font-weight:800;letter-spacing:-.02em;
  line-height:1.3;color:var(--ink);}
.s2-a2{margin-top:7px !important;font-size:14.5px;line-height:1.55;color:var(--ink);}
.s2-block .m-remark{margin-top:12px !important;}

.s2-panel{padding-top:4px;animation:panelIn .32s cubic-bezier(.2,.75,.3,1) both;}
@keyframes panelIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}

.s2-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;}
.s2-status{font-size:11.5px;font-weight:600;color:var(--muted);}
.s2-status.is-live{color:var(--live);}
.s2-sched{display:inline-flex;align-items:center;gap:6px;font-size:16px;font-weight:800;
  letter-spacing:-.01em;color:#C08A1E;cursor:pointer;padding:4px 0;}
.s2-chev{display:grid;place-items:center;transition:transform .3s;}
.s2-sched[aria-expanded="true"] .s2-chev{transform:rotate(180deg);}

/* ═══════════ GOLD — day tabs + timeline ═══════════ */
.g-days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;padding:0 6px 4px;}
.g-day{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 0 9px;
  border-radius:12px;border:1px solid var(--rule) !important;background:var(--card);cursor:pointer;
  transition:background .2s,border-color .2s,color .2s,transform .15s;}
.g-day:active{transform:scale(.95);}
.g-day-l{font-size:11px;font-weight:700;}
.g-day-n{font-size:10.5px;color:var(--muted);}
.g-day.is-today{border-color:var(--accent);}
.g-day.on{background:var(--accent);border-color:var(--accent);color:#fff;}
.g-day.on .g-day-n{color:rgba(255,255,255,.82);}
.g-day:disabled{opacity:.4;cursor:default;}
.g-caption{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--accent);padding:18px 6px 12px !important;}
.g-list{padding:0 6px 12px;display:flex;flex-direction:column;gap:12px;}
.g-item{position:relative;display:block;background:var(--card);border:1px solid var(--rule);
  border-radius:18px;padding:17px 18px 16px 22px;margin-bottom:0 !important;
  animation:cardIn .5s cubic-bezier(.2,.75,.3,1) both;
  box-shadow:0 2px 6px -2px rgba(0,0,0,.06),0 14px 26px -22px rgba(0,0,0,.5);
  overflow:hidden;transition:transform .25s cubic-bezier(.2,.75,.3,1),box-shadow .25s,border-color .25s;}
.g-item::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;
  background:linear-gradient(180deg,var(--accent-2),var(--accent));}
.g-item:hover{transform:translateY(-3px);box-shadow:0 8px 20px -10px rgba(0,0,0,.18),0 22px 38px -28px rgba(0,0,0,.35);}
.g-head{display:flex;gap:13px;align-items:flex-start;}
.g-photo{flex:0 0 auto;width:48px;height:48px;border-radius:50%;object-fit:cover;display:block;
  box-shadow:0 0 0 2px var(--card),0 0 0 5px var(--tint),0 5px 12px -6px var(--accent);}
.g-photo.is-mono{display:grid;place-items:center;font-size:18px;color:#fff;
  background:linear-gradient(150deg,var(--accent),var(--accent-2));box-shadow:0 5px 12px -6px var(--accent);}
.g-id{flex:1;min-width:0;padding-top:2px;}
.g-id h4{font-family:var(--display);font-size:18px;font-weight:600;line-height:1.2;letter-spacing:-.01em;}
.g-live{flex:0 0 auto;font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  background:var(--live);color:#fff;padding:5px 10px;border-radius:100px;
  box-shadow:0 4px 10px -5px var(--live);}
.g-item.is-live::before{background:linear-gradient(180deg,var(--live),#c8391f);}
.g-item.is-live .g-photo{box-shadow:0 0 0 2px var(--card),0 0 0 5px var(--live-soft),0 5px 12px -6px var(--live);}
.g-item.is-past{opacity:.7;background:#FAFAFA;}
.g-item.is-past::before{opacity:.5;}

/* ═══════════ PLATINUM — premium cards + bottom sheet ═══════════ */
.p-group{margin-bottom:24px !important;}
.p-gtitle{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;
  letter-spacing:.13em;text-transform:uppercase;color:var(--accent);margin:0 4px 12px !important;}
.p-gcount{margin-left:auto;letter-spacing:0;color:var(--muted);font-size:11px;}
.p-card{position:relative;background:var(--card);border:1px solid var(--rule);border-radius:18px;
  padding:16px 16px 14px 20px;margin-bottom:12px !important;overflow:hidden;
  box-shadow:0 2px 6px -2px rgba(21,20,46,.06),0 18px 32px -26px rgba(21,20,46,.5);
  animation:cardIn .5s cubic-bezier(.2,.75,.3,1) both;transition:border-color .4s,box-shadow .4s;}
.p-rail{position:absolute;left:0;top:0;bottom:0;width:4px;
  background:linear-gradient(180deg,var(--accent),var(--accent-2));}
.p-card.is-live{border-color:var(--live);box-shadow:0 0 0 3px var(--live-soft);}
.p-card.is-live .p-rail{background:var(--live);}
.p-top{display:flex;gap:13px;align-items:flex-start;}
.p-photo{flex:0 0 auto;width:54px;height:54px;border-radius:50%;object-fit:cover;display:block;
  box-shadow:0 0 0 3px var(--tint);}
.p-photo.is-mono{display:grid;place-items:center;font-size:20px;color:#fff;
  background:linear-gradient(150deg,var(--accent),var(--accent-2));}
.p-id{flex:1;min-width:0;}
.p-id h4,.p-id h3{font-size:18.5px;font-weight:700;letter-spacing:-.025em;line-height:1.2;}
.p-badge{flex:0 0 auto;font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  background:var(--live);color:#fff;padding:4px 9px;border-radius:100px;
  animation:tagIn .35s cubic-bezier(.2,.75,.3,1) both;}
.p-foot{display:flex;align-items:center;gap:12px;margin-top:14px;padding-top:13px;
  border-top:1px solid var(--rule);}
.p-foot .m-status{margin-top:0 !important;flex:1;min-width:0;font-size:12px !important;}
.p-btn{position:relative;flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;padding:11px 18px;
  border-radius:12px;background:linear-gradient(135deg,var(--accent),var(--accent-2)) !important;
  color:#fff !important;font-size:12.5px !important;font-weight:700 !important;letter-spacing:.01em;cursor:pointer;overflow:hidden;
  transition:transform .18s cubic-bezier(.2,.75,.3,1),box-shadow .25s;
  box-shadow:0 10px 22px -10px var(--accent),0 2px 5px -2px rgba(0,0,0,.25),
    inset 0 1px 0 rgba(255,255,255,.28);}
.p-btn svg{transition:transform .25s cubic-bezier(.2,.75,.3,1);}
.p-btn::after{content:"";position:absolute;top:0;left:-120%;width:60%;height:100%;
  background:linear-gradient(120deg,transparent,rgba(255,255,255,.55),transparent);
  transform:skewX(-20deg);}
.p-btn:hover{transform:translateY(-2px);
  box-shadow:0 16px 30px -12px var(--accent),0 4px 8px -3px rgba(0,0,0,.28),
    inset 0 1px 0 rgba(255,255,255,.35);}
.p-btn:hover svg{transform:scale(1.12) rotate(-4deg);}
.p-btn:hover::after{animation:pShine .7s ease;}
.p-btn:active{transform:translateY(0) scale(.96);}
@keyframes pShine{from{left:-120%;}to{left:130%;}}
.p-card.is-live .p-btn{background:linear-gradient(135deg,var(--live),#c8391f);
  box-shadow:0 10px 22px -10px var(--live),0 2px 5px -2px rgba(0,0,0,.25),
    inset 0 1px 0 rgba(255,255,255,.28);}
.p-card.is-live .p-btn:hover{box-shadow:0 16px 30px -12px var(--live),0 4px 8px -3px rgba(0,0,0,.28),
    inset 0 1px 0 rgba(255,255,255,.35);}

.sheet-wrap{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;}
.sheet-bd{position:absolute;inset:0;background:rgba(21,20,46,.5);backdrop-filter:blur(3px);
  animation:fadeIn .25s both;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.sheet{position:relative;width:100%;max-width:480px;background:#fff;
  border-radius:22px 22px 0 0;padding:10px 20px calc(22px + env(safe-area-inset-bottom));
  max-height:86vh;overflow-y:auto;animation:sheetIn .34s cubic-bezier(.2,.8,.3,1) both;}
@keyframes sheetIn{from{transform:translateY(100%);}to{transform:none;}}
.sheet-grab{display:block;width:42px;height:4px;border-radius:99px;background:var(--rule);
  margin:0 auto 18px;cursor:pointer;}
.sheet-head{display:flex;gap:13px;align-items:flex-start;}
.sheet-photo{flex:0 0 auto;width:56px;height:56px;border-radius:50%;object-fit:cover;display:block;
  box-shadow:0 0 0 3px var(--tint);}
.sheet-photo.is-mono{display:grid;place-items:center;font-size:20px;color:#fff;
  background:linear-gradient(150deg,var(--accent),var(--accent-2));}
.sheet-acts{display:flex;gap:10px;margin-top:22px;}
.sheet-close,.sheet-call{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;
  height:48px;border-radius:13px;font-size:14px !important;font-weight:600 !important;cursor:pointer;}
.sheet-close{background:var(--tint) !important;color:var(--accent) !important;}
.sheet-call{flex:1.3;background:var(--accent-2);color:#fff !important;}

/* ---------- visit ---------- */
.visit{background:var(--accent-2);color:#fff;padding:34px 22px 30px;}
.visit h2{font-family:var(--display);font-size:21px;font-weight:700;letter-spacing:-.02em;}
.address{margin-top:11px;font-size:14px;line-height:1.6;color:rgba(255,255,255,.85);max-width:32ch;}
.maplink{display:flex;align-items:center;gap:13px;margin-top:20px;padding:13px;
  border:1px solid rgba(255,255,255,.22);border-radius:14px;background:rgba(255,255,255,.1);}
.mapthumb{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;
  background:rgba(255,255,255,.18);flex:0 0 auto;}
.maplink b{display:block;font-size:14px;font-weight:600;}
.maplink em{display:block;font-style:normal;font-size:10.5px;color:rgba(255,255,255,.65);margin-top:3px;}
.maplink .arrow{margin-left:auto;}
.facts{display:flex;gap:30px;margin-top:24px !important;}
.facts dt{font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.65);}
.facts dd{font-size:17px;font-weight:600;margin-top:6px;letter-spacing:-.02em;}
.note{margin-top:24px !important;padding-top:18px !important;border-top:1px solid rgba(255,255,255,.18);
  font-size:12px;line-height:1.6;color:rgba(255,255,255,.68);}
.foot{display:flex;justify-content:space-between;padding:15px 22px;font-size:10px;
  letter-spacing:.1em;text-transform:uppercase;background:var(--ink);color:rgba(255,255,255,.72);}
.foot .dim{color:rgba(255,255,255,.45);}

.theme-platinum .visit,.theme-silver .visit,.theme-gold .visit{
  background:var(--page);color:var(--ink);border-top:1px solid var(--rule);}
.theme-platinum .address,.theme-silver .address,.theme-gold .address{color:var(--muted);}
.theme-platinum .maplink,.theme-silver .maplink,.theme-gold .maplink{
  background:var(--tint);border-color:transparent;}
.theme-platinum .mapthumb,.theme-silver .mapthumb,.theme-gold .mapthumb{background:#fff;color:var(--accent);}
.theme-platinum .maplink em,.theme-silver .maplink em,.theme-gold .maplink em{color:var(--muted);}
.theme-platinum .maplink .arrow,.theme-silver .maplink .arrow,.theme-gold .maplink .arrow{color:var(--accent);}
.theme-platinum .facts dt,.theme-silver .facts dt,.theme-gold .facts dt{color:var(--muted);}
.theme-platinum .facts dd,.theme-silver .facts dd,.theme-gold .facts dd{color:var(--accent);}
.theme-platinum .note,.theme-silver .note,.theme-gold .note{color:var(--muted);border-top-color:var(--rule);}
.theme-platinum .foot,.theme-silver .foot,.theme-gold .foot{
  background:var(--page);color:var(--muted);border-top:1px solid var(--rule);}
.theme-platinum .foot .dim,.theme-silver .foot .dim,.theme-gold .foot .dim{color:var(--muted);opacity:.6;}

/* ---------- floating action buttons ---------- */
.fab-bar{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:25;
  display:flex;flex-direction:column;gap:12px;}
.fab{display:flex;align-items:center;justify-content:center;width:54px;height:54px;border-radius:50%;
  text-decoration:none;cursor:pointer;transition:transform .25s cubic-bezier(.2,.75,.3,1),box-shadow .25s;}
.fab-ring{display:flex;align-items:center;justify-content:center;width:54px;height:54px;border-radius:50%;
  background:var(--accent-2);color:#fff;box-shadow:0 10px 24px -10px var(--accent-2),0 3px 8px -2px rgba(0,0,0,.35);}
.fab:hover .fab-ring{transform:translateY(-2px);}
.fab:hover{transform:scale(1.06);}
.fab:active{transform:scale(.95);}
.fab--map .fab-ring{background:var(--card);color:var(--accent);border:1px solid var(--rule);box-shadow:0 10px 24px -10px rgba(0,0,0,.25),0 3px 8px -2px rgba(0,0,0,.35);}
.fab--call .fab-ring{background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff;box-shadow:0 10px 24px -10px var(--accent),0 3px 8px -2px rgba(0,0,0,.35);}
.fab--map:hover .fab-ring{background:var(--tint);}
.fab svg{stroke-width:2.2;width:22px;height:22px;}

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion:reduce){
  .dd *{transition:none !important;}
  .card,.s-row,.g-item,.p-card,.tag-live,.g-live,.p-badge,.m-status,.toast,.sheet,.sheet-bd,.s-panel{
    animation:none !important;opacity:1 !important;transform:none !important;}
  .toast{transform:translateX(-50%) !important;}
  .pip--open{animation:none !important;}
  .sk-b::after{animation:none !important;}
  .sk-b{animation:sk-pulse 1.6s ease-in-out infinite !important;}
  @keyframes sk-pulse{0%,100%{opacity:.55;}50%{opacity:1;}}
}

/* ---------- print / save as PDF ---------- */
@media print{
  .topbar,.fab-bar,.toast,.search-wrap,.sheet-wrap,.strip-wrap::after,.s-chev,.p-btn{display:none !important;}
  .dd,.shell{background:#fff !important;box-shadow:none !important;}
  .shell{max-width:100% !important;padding-bottom:0 !important;}
  .card,.group,.s-row,.g-item,.p-card,.head,.visit{break-inside:avoid;page-break-inside:avoid;}
  .card,.s-row,.g-item,.p-card{animation:none !important;opacity:1 !important;transform:none !important;
    box-shadow:none !important;}
  .s-panel{display:block !important;}
  .strip{flex-wrap:wrap;overflow:visible;}
  .head,.visit,.foot,.chip.on,.g-day.on,.p-rail{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  @page{margin:12mm;}
  .s2-panel{display:block !important;}
}
`;
