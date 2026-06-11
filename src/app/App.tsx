import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { format, differenceInDays } from "date-fns";

type Screen = "date-select" | "outfit-select" | "celebration";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const KURTI_MESSAGES = [
  "Lady boss please? 🥺",
  "please ✨",
  "pleasee 🥹",
  "pakka last time 🥺🥺",
  "last day enjoy nahh.... pleasee ☃️💖",
  "I'm running out of convincing arguments 😭",
  "Please wear a saree as my birthday gift. 🌸",
];

const PETAL_DATA = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  emoji: ["🌸", "🌷", "🌹", "✿", "❀"][i % 5],
  left: (i * 4.7 + 2) % 100,
  size: 12 + (i * 5) % 16,
  delay: (i * 0.47) % 9,
  duration: 12 + (i * 1.3) % 8,
  drift: Math.sin(i * 0.8) * 70,
}));

const HEART_DATA = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  emoji: ["❤️", "💕", "💖", "💗", "💝", "🩷"][i % 6],
  left: (i * 4.2 + 1) % 100,
  size: 16 + (i * 4) % 24,
  delay: (i * 0.28) % 4,
  duration: 3.5 + (i * 0.35) % 2.5,
  drift: Math.sin(i * 1.3) * 55,
}));

/* ─────────────────────────── helpers ─────────────────────────── */

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDay(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}

/* ─────────────────────────── bg layers ─────────────────────────── */

function FloatingPetals({ dense = false }: { dense?: boolean }) {
  const data = dense ? PETAL_DATA : PETAL_DATA.slice(0, 14);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {data.map((p) => (
        <motion.span
          key={p.id}
          className="absolute select-none leading-none"
          style={{ left: `${p.left}%`, top: "-6%", fontSize: p.size }}
          animate={{ y: ["0vh", "112vh"], x: [0, p.drift], rotate: [0, p.id % 2 === 0 ? 340 : -340], opacity: [0, 0.75, 0.75, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {HEART_DATA.map((h) => (
        <motion.span
          key={h.id}
          className="absolute select-none leading-none"
          style={{ left: `${h.left}%`, bottom: "-4%", fontSize: h.size }}
          animate={{ y: [0, -920], x: [0, h.drift], opacity: [0, 1, 1, 0] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: "easeOut" }}
        >
          {h.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/* ─────────────────────────── glass card ─────────────────────────── */

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[2rem] ${className}`}
      style={{
        background: "rgba(255, 248, 251, 0.52)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1.5px solid rgba(212, 175, 106, 0.28)",
        boxShadow: "0 12px 50px rgba(196,96,122,0.13), 0 2px 12px rgba(196,96,122,0.07), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────── calendar ─────────────────────────── */

function CalendarPicker({ onSelect }: { onSelect: (d: Date) => void }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [picked, setPicked] = useState<Date | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevM = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextM = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const isPast = (d: number) => new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday = (d: number) => d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSel = (d: number) => picked?.getDate() === d && picked.getMonth() === viewMonth && picked.getFullYear() === viewYear;

  return (
    <div className="w-full">
      {/* nav */}
      <div className="flex items-center justify-between mb-5">
        <motion.button
          whileHover={{ scale: 1.15, backgroundColor: "rgba(196,96,122,0.12)" }}
          whileTap={{ scale: 0.9 }}
          onClick={prevM}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
          style={{ color: "#c4607a", border: "none", background: "rgba(196,96,122,0.07)", cursor: "pointer" }}
        >
          ‹
        </motion.button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "#5c2d4a", fontSize: "1.1rem", letterSpacing: "0.01em" }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <motion.button
          whileHover={{ scale: 1.15, backgroundColor: "rgba(196,96,122,0.12)" }}
          whileTap={{ scale: 0.9 }}
          onClick={nextM}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
          style={{ color: "#c4607a", border: "none", background: "rgba(196,96,122,0.07)", cursor: "pointer" }}
        >
          ›
        </motion.button>
      </div>

      {/* day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center" style={{ fontSize: "0.7rem", color: "#d4af6a", fontFamily: "Lato, sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}>
            {d}
          </div>
        ))}
      </div>

      {/* grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => (
          <div key={idx} className="flex items-center justify-center h-10">
            {day != null && (
              <motion.button
                whileHover={!isPast(day) ? { scale: 1.2 } : {}}
                whileTap={!isPast(day) ? { scale: 0.88 } : {}}
                onClick={() => !isPast(day) && setPicked(new Date(viewYear, viewMonth, day))}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all relative"
                style={{
                  background: isSel(day)
                    ? "linear-gradient(135deg, #c4607a, #e07a8e, #d4af6a)"
                    : isToday(day) ? "rgba(212,175,106,0.12)" : "transparent",
                  color: isSel(day) ? "white" : isPast(day) ? "rgba(92,45,74,0.25)" : "#5c2d4a",
                  fontFamily: "Lato, sans-serif",
                  fontWeight: isSel(day) || isToday(day) ? 700 : 400,
                  cursor: isPast(day) ? "not-allowed" : "pointer",
                  border: isToday(day) && !isSel(day) ? "2px solid #d4af6a" : "none",
                  outline: "none",
                  boxShadow: isSel(day) ? "0 4px 14px rgba(196,96,122,0.45)" : "none",
                  fontSize: "0.88rem",
                }}
              >
                {day}
                {isSel(day) && (
                  <motion.span
                    layoutId="sel-ring"
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "0 0 0 3px rgba(196,96,122,0.3)" }}
                  />
                )}
              </motion.button>
            )}
          </div>
        ))}
      </div>

      {/* confirm */}
      <AnimatePresence>
        {picked && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="mt-7 flex flex-col items-center gap-3"
          >
            <div
              className="px-4 py-2 rounded-full text-sm"
              style={{
                background: "rgba(212,175,106,0.12)",
                border: "1px solid rgba(212,175,106,0.35)",
                color: "#9b6b7e",
                fontFamily: "Lato, sans-serif",
              }}
            >
              ✨ {format(picked, "EEEE, MMMM do yyyy")} ✨
            </div>
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 6px 28px rgba(196,96,122,0.55)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(picked)}
              className="px-9 py-3 rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, #c4607a 0%, #d4af6a 100%)",
                fontFamily: "'Playfair Display', serif",
                fontWeight: 600,
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 22px rgba(196,96,122,0.42)",
                letterSpacing: "0.01em",
              }}
            >
              Lock This Date 🌸
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── screen 1 ─────────────────────────── */

function DateScreen({ onNext }: { onNext: (d: Date) => void }) {
  return (
    <motion.div
      key="s1"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30, scale: 0.97 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-screen px-5 py-14 relative z-10"
    >
      <div className="w-full max-w-[360px]">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 12, -12, 12, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.5 }}
            className="text-6xl mb-5 inline-block"
          >
            🌸
          </motion.div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: "#5c2d4a",
              fontSize: "1.85rem",
              lineHeight: 1.28,
              letterSpacing: "-0.01em",
            }}
          >
            When are you leaving<br />the school?
          </h1>
          <p className="mt-3" style={{ color: "#b07a92", fontFamily: "Lato, sans-serif", fontSize: "0.92rem" }}>
            Pick your special last day ✨
          </p>
        </motion.div>

        {/* card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Glass className="p-7">
            <CalendarPicker onSelect={onNext} />
          </Glass>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── screen 2 ─────────────────────────── */

function OutfitScreen({ date, onSaree }: { date: Date; onSaree: () => void }) {
  const [msgIdx, setMsgIdx] = useState(-1);
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const [clicks, setClicks] = useState(0);
  const arenaRef = useRef<HTMLDivElement>(null);

  const randomPos = useCallback(() => {
    const el = arenaRef.current;
    if (!el) return { x: 16, y: 16 };
    const { width, height } = el.getBoundingClientRect();
    const bW = 118, bH = 46, pad = 10;
    return {
      x: pad + Math.random() * Math.max(0, width - bW - pad * 2),
      y: pad + Math.random() * Math.max(0, height - bH - pad * 2),
    };
  }, []);

  const flee = useCallback(() => {
    setTimeout(() => setPos(randomPos()), 20);
  }, [randomPos]);

  const handleKurtiClick = () => {
    setMsgIdx(p => (p + 1) % KURTI_MESSAGES.length);
    setClicks(c => c + 1);
    flee();
  };

  return (
    <motion.div
      key="s2"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center min-h-screen px-5 py-14 relative z-10"
    >
      <div className="w-full max-w-[360px]">
        {/* date badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-5"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm"
            style={{
              background: "rgba(212,175,106,0.13)",
              border: "1px solid rgba(212,175,106,0.38)",
              color: "#c09050",
              fontFamily: "Lato, sans-serif",
              fontWeight: 500,
            }}
          >
            📅 {format(date, "MMMM do, yyyy")}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Glass className="overflow-hidden">
            <div className="p-7 pb-5">
              {/* title */}
              <div className="text-center mb-5">
                <motion.span
                  animate={{ scale: [1, 1.18, 1], rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                  className="text-4xl inline-block mb-3"
                >
                  ✨
                </motion.span>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    color: "#5c2d4a",
                    fontSize: "1.3rem",
                    lineHeight: 1.38,
                  }}
                >
                  What will you wear on<br />that special day?
                </h2>
              </div>

              {/* message strip */}
              <div
                className="min-h-[54px] flex items-center justify-center mb-4 rounded-2xl"
                style={{ background: "rgba(196,96,122,0.05)" }}
              >
                <AnimatePresence mode="wait">
                  {msgIdx >= 0 ? (
                    <motion.p
                      key={msgIdx}
                      initial={{ opacity: 0, y: -10, scale: 0.88 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.88 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="text-center px-4 py-2"
                      style={{
                        color: "#c4607a",
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: "italic",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        lineHeight: 1.45,
                      }}
                    >
                      {KURTI_MESSAGES[msgIdx]}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center px-4 py-2"
                      style={{ color: "#d4a8b8", fontFamily: "Lato, sans-serif", fontSize: "0.82rem" }}
                    >
                      choose your outfit below 👇
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* divider */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,106,0.35), transparent)" }} />

            {/* button arena */}
            <div
              ref={arenaRef}
              className="relative"
              style={{ height: 180 }}
            >
              {/* SAREE — fixed center, pulsing glow */}
              <motion.button
                whileHover={{ scale: 1.09 }}
                whileTap={{ scale: 0.93 }}
                onClick={onSaree}
                animate={{
                  boxShadow: [
                    "0 0 14px 2px rgba(196,96,122,0.35), 0 4px 18px rgba(196,96,122,0.25)",
                    "0 0 32px 6px rgba(196,96,122,0.7), 0 4px 24px rgba(196,96,122,0.4)",
                    "0 0 14px 2px rgba(196,96,122,0.35), 0 4px 18px rgba(196,96,122,0.25)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute text-white rounded-full"
                style={{
                  background: "linear-gradient(135deg, #c4607a 0%, #d9758a 50%, #e8a0b0 100%)",
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "1.08rem",
                  padding: "12px 36px",
                  bottom: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  border: "none",
                  zIndex: 2,
                  letterSpacing: "0.02em",
                }}
              >
                Saree ❤️
              </motion.button>

              {/* KURTI — flees */}
              <motion.button
                animate={{ x: pos.x, y: pos.y }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                onClick={handleKurtiClick}
                onMouseEnter={flee}
                className="absolute rounded-full"
                style={{
                  background: "rgba(255,248,251,0.65)",
                  border: "1.5px solid rgba(212,175,106,0.5)",
                  color: "#c4607a",
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  padding: "10px 22px",
                  top: 0,
                  left: 0,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  zIndex: 3,
                }}
              >
                Kurti 💕
              </motion.button>
            </div>

            {/* click counter */}
            <div className="px-7 pb-5 text-center">
              <AnimatePresence>
                {clicks > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs"
                    style={{ color: "#c4a0b0", fontFamily: "Lato, sans-serif" }}
                  >
                    {clicks} escape{clicks !== 1 ? "s" : ""} so far 😏
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </Glass>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── screen 3 ─────────────────────────── */

function CelebrationScreen({ date }: { date: Date }) {
  const days = differenceInDays(date, new Date());

  useEffect(() => {
    const fire = (r: number, opts: confetti.Options) =>
      confetti({
        origin: { y: 0.62 },
        ...opts,
        particleCount: Math.floor(200 * r),
        colors: ["#c4607a", "#d4af6a", "#f9e4ec", "#fff5f8", "#e8899a", "#f3c6d6", "#fce4b8"],
      });

    const burst = () => {
      fire(0.25, { spread: 28, startVelocity: 58 });
      fire(0.2, { spread: 62 });
      fire(0.35, { spread: 105, decay: 0.9, scalar: 0.78 });
      fire(0.1, { spread: 125, startVelocity: 22, decay: 0.93, scalar: 1.25 });
      fire(0.1, { spread: 125, startVelocity: 48 });
    };

    burst();
    const t1 = setTimeout(burst, 650);
    const t2 = setTimeout(burst, 1350);
    const t3 = setTimeout(burst, 2800);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      key="s3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen px-5 py-14 relative z-10"
    >
      <FloatingHearts />

      <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[360px] text-center relative z-20"
      >
        {/* big flower */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
          className="text-8xl mb-6 inline-block"
          style={{ filter: "drop-shadow(0 4px 20px rgba(196,96,122,0.35))" }}
        >
          🌷
        </motion.div>

        <Glass className="p-7 overflow-hidden relative">
          {/* subtle shimmer overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-[2rem]"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3.5, delay: 0.8, repeat: Infinity, repeatDelay: 5 }}
            style={{
              background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
            }}
          />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: "#5c2d4a",
                fontSize: "1.9rem",
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
              }}
            >
              Mission<br />Accomplished!
            </h1>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.65, type: "spring", stiffness: 180 }}
              className="text-4xl mt-2 mb-5"
            >
              😁🪻❤️
            </motion.p>

            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,106,0.45), transparent)", marginBottom: "1.25rem" }} />

            <p style={{ color: "#b07a92", fontFamily: "Lato, sans-serif", fontSize: "0.88rem", marginBottom: "0.35rem" }}>
              Official countdown started for
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: "#c4607a",
                fontSize: "1.15rem",
                marginBottom: "1.25rem",
                lineHeight: 1.35,
              }}
            >
              {format(date, "MMMM do, yyyy")} 🌝✨
            </p>

            {/* countdown box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              className="rounded-[1.4rem] py-6 px-5 mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(196,96,122,0.09), rgba(212,175,106,0.09))",
                border: "1px solid rgba(212,175,106,0.22)",
              }}
            >
              {days >= 0 ? (
                <>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      fontSize: "4rem",
                      background: "linear-gradient(135deg, #c4607a, #d4af6a)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    {days}
                  </motion.span>
                  <p style={{ color: "#b07a92", fontFamily: "Lato, sans-serif", fontSize: "0.88rem", marginTop: "0.4rem" }}>
                    {days === 1 ? "day" : "days"} to go 🌸
                  </p>
                </>
              ) : (
                <p style={{ color: "#c4607a", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.1rem" }}>
                  The day has arrived! 🎊
                </p>
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              style={{ color: "#c4a8b6", fontFamily: "Lato, sans-serif", fontStyle: "italic", fontSize: "0.82rem" }}
            >
              Can't wait to see you in that saree 💕
            </motion.p>
          </motion.div>
        </Glass>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── root ─────────────────────────── */

export default function App() {
  const [screen, setScreen] = useState<Screen>("date-select");
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #fdf0f5 0%, #fdf7f2 45%, #fef9f1 75%, #fdf0f5 100%)" }}
    >
      {/* ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "55%", height: "55%", background: "radial-gradient(circle, rgba(212,175,106,0.16) 0%, transparent 68%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-8%", left: "-8%", width: "48%", height: "48%", background: "radial-gradient(circle, rgba(196,96,122,0.13) 0%, transparent 68%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "70%", height: "70%", background: "radial-gradient(circle, rgba(255,240,248,0.3) 0%, transparent 65%)", borderRadius: "50%" }} />
      </div>

      <FloatingPetals dense={screen === "celebration"} />

      <AnimatePresence mode="wait">
        {screen === "date-select" && (
          <DateScreen
            key="date"
            onNext={(d) => { setDate(d); setScreen("outfit-select"); }}
          />
        )}
        {screen === "outfit-select" && date && (
          <OutfitScreen
            key="outfit"
            date={date}
            onSaree={() => setScreen("celebration")}
          />
        )}
        {screen === "celebration" && date && (
          <CelebrationScreen key="celeb" date={date} />
        )}
      </AnimatePresence>
    </div>
  );
}
