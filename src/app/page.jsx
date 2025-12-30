// src/app/page.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const SLOGANS = [
  "Место, где треки получают свою страницу",
  "Каждому треку - своя страница",
  "Трек в центре внимания",
  "Страницы треков для сторис и био",
  "Трек как ссылка с лицом",
  "Страница как дом трека",
  "Дом для одного трека",
  "У каждого трека есть адрес",
  "Трек, которому дали место",
  "Страницы треков нового типа",
  "Новый стандарт страницы трека",
  "Официальные страницы для релизов артистов",
  "Артист. Трек. Страница",
  "Страница, которая ведёт к треку",
  "Твоя музыка в одной Тюбитейке",
  "Трек под тюбетейкой",
  "Тюбетейка для одного трека",
  "Трек, которому дали тюбетейку",
  "Музыка под своей тюбетейкой",
  "Трек внутри тюбетейки",
  "Музыка в тюбетейке",
  "Тюбетейка над треком",
  "Трек с крышей",
  "Музыка под крышей",
];

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQueue(list, lastValue) {
  // Shuffle, but avoid immediate repeat of lastValue if possible
  const s = shuffle(list);
  if (s.length > 1 && s[0] === lastValue) {
    // swap first with some other
    const k = 1 + Math.floor(Math.random() * (s.length - 1));
    [s[0], s[k]] = [s[k], s[0]];
  }
  return s;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;

    const update = () => setReduced(!!mq.matches);
    update();

    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  return reduced;
}

function RotatingSlogan({
  items,
  intervalMs = 5000,
  animMs = 520,
  className = "",
}) {
  const prefersReduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(() => items[0] || "");
  const [next, setNext] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | anim

  const queueRef = useRef([]);
  const lastRef = useRef(current);
  const timersRef = useRef({ tick: null, swap: null });

  const ensureQueue = () => {
    if (!queueRef.current.length) {
      queueRef.current = buildQueue(items, lastRef.current);
    }
  };

  useEffect(() => {
    lastRef.current = current;
  }, [current]);

  useEffect(() => {
    // init queue so first rotate doesn't repeat current
    queueRef.current = buildQueue(items, current).filter((x) => x !== current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!items?.length) return;

    const clearTimers = () => {
      const t = timersRef.current;
      if (t.tick) clearInterval(t.tick);
      if (t.swap) clearTimeout(t.swap);
      timersRef.current = { tick: null, swap: null };
    };

    clearTimers();

    // Reduced motion: no slide, just swap text.
    if (prefersReduced) {
      timersRef.current.tick = setInterval(() => {
        ensureQueue();
        const n = queueRef.current.shift();
        if (!n) return;
        setCurrent(n);
      }, intervalMs);

      return clearTimers;
    }

    timersRef.current.tick = setInterval(() => {
      ensureQueue();
      const n = queueRef.current.shift();
      if (!n) return;

      setNext(n);
      setPhase("anim");

      timersRef.current.swap = setTimeout(() => {
        setCurrent(n);
        setNext("");
        setPhase("idle");
      }, animMs);
    }, intervalMs);

    return clearTimers;
  }, [items, intervalMs, animMs, prefersReduced]);

  return (
    <div
      className={`toqibox-slogan ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className={`line current ${
          prefersReduced ? "reduced" : phase === "anim" ? "out" : "in"
        }`}
      >
        {current}
      </span>

      {!prefersReduced && (
        <span className={`line next ${phase === "anim" ? "in" : "idle"}`}>
          {next}
        </span>
      )}
    </div>
  );
}

export default function HomePage() {
  const slogans = useMemo(() => SLOGANS, []);

  return (
    <main style={styles.body}>
      <style>{css}</style>

      <div style={styles.wrap}>
        <h1 style={styles.logo}>TOQIBOX</h1>

        <RotatingSlogan
          items={slogans}
          intervalMs={5000}
          animMs={520}
          className="toqibox-slogan--home"
        />

        <Link to="/create" style={styles.btn}>
          СОЗДАТЬ
        </Link>
      </div>
    </main>
  );
}

const styles = {
  body: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: `
      radial-gradient(900px 700px at 18% 18%, rgba(200,160,120,0.16), transparent 60%),
      radial-gradient(900px 700px at 82% 26%, rgba(140,170,210,0.14), transparent 58%),
      linear-gradient(165deg, #fbf6ef, #f6f1ea 48%, #eef1f6)
    `,
    color: "rgba(0,0,0,0.92)",
  },

  wrap: {
    width: "min(820px, 92vw)",
    display: "grid",
    justifyItems: "center",
    gap: "22px",
    padding: "56px 0",
    textAlign: "center",
  },

  logo: {
    margin: 0,
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    fontWeight: 800,
    fontSize: "clamp(46px, 7vw, 92px)",
    letterSpacing: "0.12em",
    lineHeight: 1,
    textTransform: "uppercase",
  },

  btn: {
    marginTop: "10px",
    padding: "14px 30px",
    borderRadius: "14px",
    border: "1px solid rgba(0,0,0,0.18)",
    textDecoration: "none",
    color: "rgba(0,0,0,0.78)",
    fontWeight: 700,
    fontSize: "14px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    transition:
      "background 160ms ease, color 160ms ease, border-color 160ms ease, transform 160ms ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const css = `
.toqibox-slogan {
  position: relative;
  width: min(720px, 92vw);
  height: 22px; /* fixed to prevent layout jump */
  overflow: hidden;
  display: grid;
  place-items: center;
  margin: 0;
  user-select: none;
}

.toqibox-slogan .line {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.78;
  will-change: transform, opacity;
  transform: translateY(0);
  transition: transform 520ms ease, opacity 520ms ease;
}

.toqibox-slogan .line.reduced {
  position: static;
  transition: none;
}

.toqibox-slogan .line.current.in {
  transform: translateY(0);
  opacity: 0.78;
}

.toqibox-slogan .line.current.out {
  transform: translateY(-110%);
  opacity: 0;
}

.toqibox-slogan .line.next {
  transform: translateY(110%);
  opacity: 0;
}

.toqibox-slogan .line.next.in {
  transform: translateY(0);
  opacity: 0.78;
}

.toqibox-slogan .line.next.idle {
  transform: translateY(110%);
  opacity: 0;
}

/* hover feel for button */
a[style]{
  -webkit-tap-highlight-color: transparent;
}
a[style]:hover {
  background: rgba(0,0,0,0.92) !important;
  color: rgba(255,255,255,0.96) !important;
  border-color: rgba(0,0,0,0.32) !important;
  transform: translateY(-1px);
}
a[style]:active {
  transform: translateY(0px) scale(0.99);
}
a[style]:focus-visible {
  outline: 2px solid rgba(0,0,0,0.22);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  a[style]{
    transition: none !important;
  }
}
`;
