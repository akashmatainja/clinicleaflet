import React, { useEffect, useMemo, useRef, useState } from "react";

/* ==================================================================
   D D Health — QR landing page (mobile first)
   URL shape:  https://your-domain.com/clinic?id=5272

   ── THEME ────────────────────────────────────────────────────────
   Every colour on the page comes from the block marked BRAND in the
   CSS below. Change those values to match medcoclinics.com exactly
   and the whole page re-themes; nothing else needs editing.
==================================================================== */

const API = "https://medcoclinics.com/api/clinic/clinicdetails/id";
const CDN = "https://www.medcoclinics.com/storage/category/";

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

/* ---------- Time handling -----------------------------------------
   The API mixes "17.00", "09.00", "5:00 PM" and "10:00 AM" in the
   same field. One parser normalises all of it to minutes.          */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

/* Every sitting of one doctor, day by day, in week order. */
function weekRows(doc) {
  return buildSlots([doc])
    .sort((a, b) => (a.dayIndex - b.dayIndex) || (a.start - b.start))
    .map(({ dayIndex, start, end }) => ({ dayIndex, day: DAYS[dayIndex], start, end }));
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
  const rosterRef = useRef(null);
  const todayRailRef = useRef(null);
  const liveCardRef = useRef(null);

  // Poll for URL changes
  useEffect(() => {
    const interval = setInterval(() => {
      const pathId = new URLSearchParams(window.location.search).get("id");
      if (pathId !== currentId) {
        setCurrentId(pathId);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentId]);

  useEffect(() => {
    const id = currentId;
    
    if (!id) {
      setLoading(false);
      setData(null);
      return;
    }
    
    setLoading(true);
    setData(null); // Clear previous data while loading
    const ctrl = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, 8000);
    (async () => {
      try {
        const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
          method: "POST", headers: { Accept: "application/json" }, signal: ctrl.signal,
        });
        const json = await res.json();
        if (json && json.clinic) {
          setData(json);
        } else {
          setData(null);
        }
        clearTimeout(timer);
        setLoading(false);
      } catch (err) {
        // Only handle real failures/timeouts. Ignore cleanup aborts (StrictMode
        // re-run / navigation) so we don't flash "Clinic Not Found".
        if (err.name === "AbortError" && !timedOut) return;
        setData(null);
        clearTimeout(timer);
        setLoading(false);
      }
    })();
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [currentId]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    const onScroll = () => setScrolled(window.scrollY > 220);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearInterval(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  const clinic = data?.clinic;
  const doctors = data?.doctor || data?.doctors || data?.Doctor || [];
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const today = now.getDay();

  const visible = (filter === "all" || !filter) ? doctors : doctors.filter((d) => d.category === filter);
  const searched = searchQuery.trim() 
    ? visible.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : visible;
  const grouped = useMemo(() => {
    const m = new Map();
    searched.forEach((d) => { if (!m.has(d.category)) m.set(d.category, []); m.get(d.category).push(d); });
    return [...m.entries()];
  }, [searched]);

  useEffect(() => {
    if (loading) return;
    // Force all reveal elements to be visible immediately
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
  }, [loading, grouped]);

  const todaySlots = useMemo(
    () => buildSlots(doctors).filter((s) => s.dayIndex === today).sort((a, b) => a.start - b.start),
    [doctors, today]
  );

  /* Centre whoever is sitting right now inside the horizontal rail. */
  useEffect(() => {
    if (loading || !todayRailRef.current || !liveCardRef.current) return;
    const rail = todayRailRef.current, card = liveCardRef.current;
    rail.scrollTo({
      left: Math.max(0, card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2),
      behavior: "smooth",
    });
  }, [loading, todaySlots.length, nowMins]);

  const sitting = todaySlots.filter((s) => nowMins >= s.start && nowMins < s.end);
  const next = todaySlots.find((s) => s.start > nowMins);
  const lastEnd = todaySlots.length ? Math.max(...todaySlots.map((s) => s.end)) : null;
  const firstStart = todaySlots.length ? todaySlots[0].start : null;

  let status = { tone: "closed", line: "No chambers today" };
  if (sitting.length) status = { tone: "open", line: `${sitting.length} doctor${sitting.length > 1 ? "s" : ""} sitting now` };
  else if (next) status = { tone: "soon", line: `Next chamber at ${tidy(next.start)}` };
  else if (lastEnd != null && nowMins >= lastEnd) status = { tone: "closed", line: "Chambers finished for today" };
  else if (firstStart != null) status = { tone: "soon", line: `First chamber at ${tidy(firstStart)}` };

  const usedCats = useMemo(() => {
    const cats = data?.category || [];
    const imgOf = new Map(cats.map((c) => [c.name, c.image || c.images]));
    const counts = new Map();
    doctors.forEach((d) => counts.set(d.category, (counts.get(d.category) || 0) + 1));
    const known = cats.map((c) => c.name).filter((n) => counts.has(n));
    const extra = [...counts.keys()].filter((n) => !known.includes(n));
    return [...known, ...extra].map((name) => ({
      name, count: counts.get(name), image: imgOf.get(name) || null,
    }));
  }, [data, doctors]);
  const imageOf = useMemo(() => new Map(usedCats.map((c) => [c.name, c.image])), [usedCats]);

  const name = (clinic?.name || "").replace(/\s+/g, " ").trim();
  const tel = clinic?.phone || clinic?.shop_phone;
  const shopPhone = clinic?.shop_phone;
  const maps = clinic ? `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}` : "#";
  const dateLabel = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  // Update document title with clinic name
  useEffect(() => {
    if (name) {
      document.title = `${name} - Clinic Schedule`;
    } else {
      document.title = "Clinic Schedule";
    }
  }, [name]);

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
    <div className="dd">
      <style>{CSS}</style>

      <div className={`topbar ${scrolled ? "show" : ""}`}>
        <div className="topbar-in">
          <span className="topbar-name">{name}</span>
          <a className="topbar-call" href={`tel:${tel || ""}`}><Phone /> Call</a>
        </div>
      </div>

      <div className="shell">
        {/* ═══ Universal Loader ═══ */}
        {loading && (
          <div className="universal-loader">
            <div className="spinner"></div>
            <p>Loading clinic data...</p>
          </div>
        )}

        {/* ═══ Header: name, address and contact ═══ */}
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
                  <p className="clinic-phone" onClick={() => navigator.clipboard.writeText(tel)} title="Click to copy">
                    <span className="phone-icon"><Phone /></span>
                    {tel}
                  </p>
                )}
                {shopPhone && shopPhone !== tel && (
                  <p className="clinic-phone" onClick={() => navigator.clipboard.writeText(shopPhone)} title="Click to copy">
                    <span className="phone-icon"><Phone /></span>
                    {shopPhone}
                  </p>
                )}
              </div>
            )}
          </header>
        )}

        {/* ═══ No data / invalid ID message ═══ */}
        {!loading && !clinic && (
          <div className="no-id-message">
            <h2>Clinic Not Found</h2>
            <p>No clinic data is available for this link.</p>
          </div>
        )}

        {/* ═══ Content sections (only show when data is loaded) ═══ */}
        {!loading && clinic && (
          <>
        {/* ═══ Today — horizontal, live doctor centred ═══ */}
        {/* <section className="today">
          <div className="sec-head">
            <div>
              <h2>Who is here today</h2>
              <p className="sub">
                <span className={`pip pip--${status.tone}`} />
                {loading ? "Checking today's chambers" : status.line} · {dateLabel}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="lane">{[0, 1, 2].map((i) => <div key={i} className="skel-slot" />)}</div>
          ) : todaySlots.length === 0 ? (
            <p className="empty">No chambers are scheduled today. Call the clinic to ask about tomorrow.</p>
          ) : (
            <div className="lane" ref={todayRailRef}>
              {todaySlots.map((s) => {
                const isNow = nowMins >= s.start && nowMins < s.end;
                const past = nowMins >= s.end;
                return (
                  <article
                    key={`${s.doc.id}-${s.start}`}
                    ref={isNow ? liveCardRef : null}
                    className={`slot ${isNow ? "is-now" : ""} ${past ? "is-past" : ""}`}
                  >
                    <div className="slot-head">
                      <CatIcon name={s.doc.category} src={imageOf.get(s.doc.category)} size="sm" />
                      {isNow ? <span className="pill-live">Sitting now</span>
                        : past ? <span className="pill-done">Finished</span>
                        : <span className="pill-next">Later today</span>}
                    </div>
                    <h3 className="slot-name">{s.doc.name}</h3>
                    <p className="slot-cat">{s.doc.category}</p>
                    <p className="slot-time mono">{tidy(s.start)} – {tidy(s.end)}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section> */}

        {/* ═══ Compact speciality chips ═══ */}
        <section className="find">
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
            <div className="search-wrap">
              <input
                type="text"
                placeholder="Search doctor name..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
              )}
            </div>
          </div>
        </section>

        {/* ═══ Roster — full width ═══ */}
        <section className="roster" ref={rosterRef}>
          {loading
            ? [0, 1, 2].map((i) => <div key={i} className="skel-card" />)
            : grouped.map(([cat, docs]) => (
                <div className="group" key={cat}>
                  <h3 className="group-title">
                    <CatIcon name={cat} src={imageOf.get(cat)} size="xs" />
                    <span>{cat}</span>
                    <i className="gline" />
                  </h3>
                  {docs.map((doc, i) => (
                    <DoctorCard key={doc.id} doc={doc} today={today} nowMins={nowMins} index={i}
                                catImage={imageOf.get(doc.category)} />
                  ))}
                </div>
              ))}
        </section>

        {/* ═══ Visit ═══ */}
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

      <div className="actions">
        <a className="btn btn--ghost" href={maps} target="_blank" rel="noreferrer"><MapPin /> Directions</a>
        <a className="btn btn--solid" href={`tel:${tel || ""}`}><Phone /> Call the clinic</a>
      </div>
    </div>
  );
}

/* Long department names get a shorter label on the chips only. */
function shortCat(name) {
  const map = {
    "General Physician": "Physician",
    "General Medicine": "Medicine",
    "Child Specialist": "Child",
    "Chest Specialist": "Chest",
    Physiotherapist: "Physio",
    Dermatologists: "Skin",
    Cardiologists: "Heart",
    Orthopedic: "Ortho",
    Gynecologist: "Gynae",
  };
  return map[name] || name;
}

/* ================================================================== */
function DoctorCard({ doc, today, nowMins, index, catImage }) {
  const rows = weekRows(doc);
  const todayRows = rows.filter((r) => r.dayIndex === today);
  const sittingNow = todayRows.some((r) => nowMins >= r.start && nowMins < r.end);
  const upcoming = todayRows.find((r) => r.start > nowMins);
  const monogram = doc.name.replace(/^Dr\.?\s*/i, "").trim().charAt(0).toUpperCase();
  const degrees = (doc.degree || []).map((d) => d.degree).filter(Boolean);
  const photo = doc.image || doc.images || doc.photo || doc.avatar || "http://www.medcoclinics.com/assets/img/avatar/avatar-1.png";
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <article className={`card reveal ${sittingNow ? "card--live" : ""}`}
             style={{ transitionDelay: `${Math.min(index, 6) * 50}ms` }}>
      <div className="card-top">
        {!photoFailed ? (
          <img className="photo" src={photo} alt="" loading="lazy" onError={() => setPhotoFailed(true)} />
        ) : (
          <span className="monogram mono" aria-hidden="true">{monogram}</span>
        )}
        <div className="card-id">
          <h4>{doc.name}</h4>
          <p className="cat-line">
            <CatIcon name={doc.category} src={catImage} size="xs" />{doc.category}
          </p>
          {degrees.length > 0 && <p className="degrees">{degrees.join(" · ")}</p>}
          {doc.experience ? <p className="exp mono">{doc.experience} in practice</p> : null}
        </div>
        {sittingNow && <span className="tag-live">Now</span>}
      </div>

      <div className="sched">
        <p className="sched-h">Chamber timings</p>
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

      {doc.remark && <p className="remark">{doc.remark.charAt(0).toUpperCase() + doc.remark.slice(1)}</p>}
      {sittingNow ? <p className="live">Sitting now — walk in</p>
        : upcoming ? <p className="soon">Here today from {tidy(upcoming.start)}</p> : null}
    </article>
  );
}

/* Category image from the API, with a drawn glyph as fallback. */
function CatIcon({ name, src, size }) {
  const [failed, setFailed] = useState(false);
  const hasSrc = typeof src === "string" && src.trim().length > 0 && /\.(png|jpe?g|webp|svg)$/i.test(src.trim());
  const cls = size ? `cat-ic cat-ic--${size}` : "cat-ic";
  return (
    <span className={cls}>
      {failed || !hasSrc ? <Glyph name={name} /> : <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />}
    </span>
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
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

body{margin:0;padding:0;}

.dd{
  /* ══ BRAND — edit these to match medcoclinics.com ══ */
  --brand:#0E906E;          /* primary green */
  --brand-deep:#0A7C7A;     /* darker teal for header + solid buttons */
  --brand-soft:#E6F5F4;     /* tinted background for icons and pills */
  --live:#E8553D;           /* "sitting now" highlight */
  --live-soft:#FDEDE9;
  --bg:#F4F7F7;             /* page background */
  /* ══════════════════════════════════════════════════ */

  --card:#FFFFFF; --ink:#12262B; --muted:#63808A; --rule:#E2EAEB;
  --body:'Instrument Sans',system-ui,-apple-system,sans-serif;
  --mono:'DM Mono',ui-monospace,monospace;
  background:#E6ECEC; font-family:var(--body); color:var(--ink);
  -webkit-font-smoothing:antialiased; min-height:100%;
}
.dd *,.dd *::before,.dd *::after{box-sizing:border-box;}
.dd h1,.dd h2,.dd h3,.dd h4,.dd p,.dd ul,.dd ol,.dd dl,.dd dd{margin:0;padding:0;}
.dd ul,.dd ol{list-style:none;}
.dd a{color:inherit;text-decoration:none;}
.dd button{font:inherit;}
.dd .mono{font-family:var(--mono);font-feature-settings:"tnum";}
.dd :focus-visible{outline:2.5px solid var(--brand);outline-offset:3px;border-radius:6px;}

.shell{max-width:480px;margin:0 auto;background:var(--bg);min-height:100vh;
  padding-bottom:112px;box-shadow:0 0 0 1px rgba(18,38,43,.06);}

/* ---------- condensed topbar ---------- */
.topbar{position:fixed;top:0;left:0;right:0;z-index:30;transform:translateY(-100%);
  transition:transform .3s cubic-bezier(.3,.8,.3,1);pointer-events:none;}
.topbar.show{transform:none;pointer-events:auto;}
.topbar-in{max-width:480px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;
  gap:12px;padding:11px 16px;background:var(--brand-deep);color:#fff;}
.topbar-name{font-size:15px;font-weight:700;letter-spacing:-.01em;}
.topbar-call{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;
  background:#fff;color:#ff2400 !important;padding:7px 13px;border-radius:100px;}

/* ---------- header: name + address + contact ---------- */
.head{background:#0E906E;color:#fff;padding:34px 22px 30px;text-align:center;}
.clinic-name{font-size:29px;font-weight:700;letter-spacing:-.025em;line-height:1.15;}
.clinic-address{display:flex;gap:9px;align-items:center;justify-content:center;margin-top:13px !important;
  font-size:13.5px;line-height:1.55;}
.pin{flex:0 0 auto;opacity:.85;}
.clinic-phones{display:flex;gap:12px;justify-content:center;margin-top:13px !important;}
.clinic-phone{display:flex;gap:9px;align-items:center;
  font-size:13.5px;line-height:1.55;cursor:pointer;user-select:none;}
.clinic-phone:hover{color:#fff;}
.phone-icon{flex:0 0 auto;opacity:.85;}

/* ---------- no data / not found message ---------- */
.no-id-message{text-align:center;padding:60px 22px;}
.no-id-message h2{font-size:24px;font-weight:700;color:var(--ink);margin-bottom:12px;}
.no-id-message p{font-size:14px;color:var(--muted);line-height:1.6;}

/* ---------- universal loader ---------- */
.universal-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:80px 22px;text-align:center;}
.spinner{width:48px;height:48px;border:4px solid var(--brand-soft);border-top-color:var(--brand-deep);
  border-radius:50%;animation:spin 1s linear infinite;margin-bottom:16px;}
@keyframes spin{to{transform:rotate(360deg);}}
.universal-loader p{font-size:14px;color:var(--muted);font-weight:500;}

/* ---------- section chrome ---------- */
.today{padding:26px 0 24px;}
.find{padding:6px 0 6px;}
.roster{padding:8px 16px 30px;}

/* ---------- search field ---------- */
.search-wrap{position:relative;padding:0 22px;}
.search-input{width:100%;padding:11px 40px 11px 14px;font-size:13.5px;
  border:1px solid var(--rule);border-radius:12px;background:var(--card);
  color:var(--ink);outline:none;transition:border-color .2s;}
.search-input:focus{border-color:var(--brand-deep);}
.search-input::placeholder{color:var(--muted);}
.search-clear{position:absolute;right:32px;top:50%;transform:translateY(-50%);
  width:24px;height:24px;border:none;background:transparent;color:var(--muted);
  font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
  border-radius:50%;transition:background .2s,color .2s;}
.search-clear:hover{background:var(--rule);color:var(--ink);}
.sec-head{padding:0 22px;margin-bottom:16px !important;}
.sec-head h2{font-size:20px;font-weight:700;letter-spacing:-.02em;}
.sub{display:flex;align-items:center;gap:7px;margin-top:6px !important;font-size:12.5px;color:var(--muted);}
.pip{width:7px;height:7px;border-radius:50%;flex:0 0 auto;background:var(--muted);}
.pip--open{background:var(--live);animation:pulse 2s infinite;}
.pip--soon{background:var(--brand);}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(232,85,61,.5);}70%{box-shadow:0 0 0 8px rgba(232,85,61,0);}100%{box-shadow:0 0 0 0 rgba(232,85,61,0);}}
.empty{padding:0 22px;font-size:13.5px;color:var(--muted);line-height:1.6;}

/* ---------- today lane (horizontal) ---------- */
.lane{display:flex;gap:11px;overflow-x:auto;padding:4px 22px 8px;
  scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.lane::-webkit-scrollbar{display:none;}
.slot{flex:0 0 auto;width:186px;scroll-snap-align:center;background:var(--card);
  border:1px solid var(--rule);padding:14px;
  box-shadow:0 1px 2px rgba(18,38,43,.04);}
.slot-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px !important;}
.pill-live,.pill-next,.pill-done{font-size:9.5px;font-weight:600;letter-spacing:.08em;
  text-transform:uppercase;padding:4px 8px;border-radius:100px;white-space:nowrap;}
.pill-live{background:var(--live);color:#fff;}
.pill-next{background:var(--brand-soft);color:var(--brand-deep);}
.pill-done{background:#EEF2F2;color:var(--muted);}
.slot-name{font-size:15.5px;font-weight:700;letter-spacing:-.02em;line-height:1.25;}
.slot-cat{font-size:11.5px;color:var(--muted);margin-top:4px !important;}
.slot-time{margin-top:11px !important;padding-top:10px;border-top:1px dashed var(--rule);
  font-size:12.5px;font-weight:500;color:var(--brand-deep);}
.slot.is-now{border-color:var(--live);box-shadow:0 0 0 3px var(--live-soft);}
.slot.is-now .slot-time{color:var(--live);}
.slot.is-past{opacity:.55;}

/* ---------- compact speciality chips ---------- */
.strip-wrap{position:relative;}
.strip-wrap::after{content:"";position:absolute;top:0;bottom:0;right:0;width:26px;pointer-events:none;
  background:linear-gradient(90deg,rgba(244,247,247,0),var(--bg));}
.strip{display:flex;gap:7px;overflow-x:auto;padding:2px 22px 16px;scrollbar-width:none;}
.strip::-webkit-scrollbar{display:none;}
.chip{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 13px 0 9px;
  border-radius:100px;border:1px solid var(--rule);background:var(--card);color:var(--ink);
  font-size:13px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;cursor:pointer;
  transition:background .18s,color .18s,border-color .18s,transform .15s;}
.chip:active{transform:scale(.96);}
.chip-ic,.cat-ic--chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;
  background:var(--brand-soft);color:var(--brand-deep);flex:0 0 auto;overflow:hidden;}
.cat-ic--chip img{width:15px;height:15px;object-fit:contain;}
.chip-n{font-size:11px;color:var(--muted);}
.chip.on{background:var(--brand-deep);border-color:var(--brand-deep);color:#fff;}
.chip.on .chip-ic,.chip.on .cat-ic--chip{background:rgba(255,255,255,.18);color:#fff;}
.chip.on .cat-ic--chip img{filter:brightness(0) invert(1);}
.chip.on .chip-n{color:rgba(255,255,255,.72);}

/* ---------- shared category icon ---------- */
.cat-ic{display:inline-grid;place-items:center;}
.cat-ic img{display:block;object-fit:contain;}
.cat-ic--xs{width:16px;height:16px;} .cat-ic--xs img{width:15px;height:15px;}
.cat-ic--sm{width:32px;height:32px;border-radius:9px;background:var(--brand-soft);color:var(--brand-deep);}
.cat-ic--sm img{width:19px;height:19px;}

/* ---------- roster, full width ---------- */
.group{margin-bottom:22px !important;}
.group-title{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;
  letter-spacing:.13em;text-transform:uppercase;color:var(--brand-deep);margin:0 6px 11px;}
.gline{flex:1;height:1px;background:var(--rule);}
.gcount{font-size:11px;color:var(--muted);letter-spacing:0;}
.card{position:relative;background:var(--card);border:1px solid var(--rule);
  padding:10px;margin-bottom:12px !important;box-shadow:0 1px 2px rgba(18,38,43,.04),0 12px 24px -22px rgba(18,38,43,.4);
  opacity:0;transform:translateY(12px);transition:opacity .5s ease,transform .5s cubic-bezier(.2,.75,.3,1);}
.card.in{opacity:1;transform:none;}
.card--live{border-color:var(--live);box-shadow:0 0 0 3px var(--live-soft);}
.card-top{display:flex;gap:13px;align-items:flex-start;}
.photo,.monogram{flex:0 0 auto;width:52px;height:52px;border-radius:15px;}
.photo{object-fit:cover;display:block;}
.monogram{display:grid;place-items:center;font-size:19px;color:#fff;background:var(--brand-deep);}
.card-id{flex:1;min-width:0;}
.card-id h4{font-size:19px;font-weight:700;letter-spacing:-.025em;line-height:1.2;}
.cat-line{display:flex;align-items:center;gap:6px;margin-top:6px !important;font-size:12.5px;
  font-weight:600;color:var(--brand-deep);}
.degrees{font-size:12px;color:var(--muted);margin-top:6px !important;line-height:1.5;}
.exp{font-size:11px;color:var(--muted);margin-top:4px !important;}
.tag-live{flex:0 0 auto;font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  background:var(--live);color:#fff;padding:4px 9px;border-radius:100px;}

.sched{margin-top:16px !important;padding-top:14px;border-top:1px solid var(--rule);}
.sched-h{font-size:10.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
  color:var(--muted);margin-bottom:10px !important;}
.sched ul{display:flex;flex-direction:column;gap:9px;}
.sched li{display:flex;align-items:baseline;gap:9px;font-size:13.5px;}
.day{font-weight:500;white-space:nowrap;}
.leader{flex:1;height:1px;border-bottom:1px dotted var(--rule);transform:translateY(-3px);}
.time{color:var(--muted);white-space:nowrap;font-size:12.5px;}
.row-today .day{color:var(--brand-deep);font-weight:700;}
.row-today .time{color:var(--brand-deep);}
.row-live .day,.row-live .time{color:var(--live);font-weight:700;}

.remark{margin-top:15px !important;font-size:12.5px;color:var(--brand-deep);line-height:1.55;
  padding:10px 12px;background:#FFF8E1;border:1px solid #FFD54F;border-radius:10px;font-weight:500;text-align:center;}
.live,.soon{margin-top:14px !important;font-size:12.5px;font-weight:600;}
.live{color:var(--live);} .soon{color:var(--muted);}

/* ---------- visit ---------- */
.visit{background:var(--brand-deep);color:#fff;padding:34px 22px 30px;}
.visit h2{font-size:21px;font-weight:700;letter-spacing:-.02em;}
.address{margin-top:11px !important;font-size:14px;line-height:1.6;color:rgba(255,255,255,.82);max-width:32ch;}
.maplink{display:flex;align-items:center;gap:13px;margin-top:20px !important;padding:13px;
  border:1px solid rgba(255,255,255,.22);border-radius:14px;background:rgba(255,255,255,.08);}
.mapthumb{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;
  background:rgba(255,255,255,.16);flex:0 0 auto;}
.maplink b{display:block;font-size:14px;font-weight:600;}
.maplink em{display:block;font-style:normal;font-size:10.5px;color:rgba(255,255,255,.6);margin-top:3px;}
.maplink .arrow{margin-left:auto;}
.facts{display:flex;gap:30px;margin-top:24px !important;}
.facts dt{font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.6);}
.facts dd{font-size:17px;font-weight:600;margin-top:6px !important;letter-spacing:-.02em;}
.note{margin-top:24px !important;padding-top:18px;border-top:1px solid rgba(255,255,255,.16);
  font-size:12px;line-height:1.6;color:rgba(255,255,255,.62);}
.foot{display:flex;justify-content:space-between;padding:15px 22px;font-size:10px;
  letter-spacing:.1em;text-transform:uppercase;background:#08615F;color:rgba(255,255,255,.7);}
.foot .dim{color:rgba(255,255,255,.4);}

/* ---------- sticky actions ---------- */
.actions{position:fixed;left:0;right:0;bottom:0;z-index:25;max-width:480px;margin:0 auto;display:flex;gap:10px;
  padding:13px 16px calc(13px + env(safe-area-inset-bottom));
  background:linear-gradient(to top,var(--bg) 62%,rgba(244,247,247,0));}
.btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:50px;border-radius:14px;
  font-size:14.5px;font-weight:600;transition:transform .15s;}
.btn:active{transform:scale(.97);}
.btn--solid{flex:1.5;background:#0E906E;color:#fff !important;
  box-shadow:0 12px 24px -12px rgba(10,124,122,.8);}
.btn--ghost{background:#0E906E;border:1px solid var(--rule);color:#fff !important;}

/* ---------- skeletons ---------- */
.skel-header-name{width:200px;height:35px;border-radius:8px;margin:0 auto;background:rgba(255,255,255,.3);animation:shim 1.3s infinite;}
.skel-header-address{width:280px;height:20px;border-radius:6px;margin:13px auto 0;background:rgba(255,255,255,.25);animation:shim 1.3s infinite;}
.skel-header-phone{width:120px;height:20px;border-radius:6px;margin:13px auto 0;background:rgba(255,255,255,.25);animation:shim 1.3s infinite;}
.skel-slot{flex:0 0 auto;width:186px;height:132px;border-radius:16px;background:#E4EBEB;animation:shim 1.3s infinite;}
.skel-card{height:210px;border-radius:18px;margin-bottom:12px !important;background:#E4EBEB;animation:shim 1.3s infinite;}
@keyframes shim{0%,100%{opacity:.5;}50%{opacity:.95%;}}

@media (prefers-reduced-motion:reduce){
  .dd *{animation:none !important;transition:none !important;}
  .card{opacity:1;transform:none;}
}
`;
