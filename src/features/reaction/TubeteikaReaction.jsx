import React, { useEffect, useRef, useState } from "react";
import tubeteikaReaction from "../../assets/tubeteika-reaction.svg";

function spawnHearts(layer) {
  if (!layer) return;

  const COUNT = 16;

  for (let i = 0; i < COUNT; i++) {
    const heart = document.createElement("span");
    heart.className = "tr-heart";

    // мягче разлёт + дольше жизнь
    const dx = (Math.random() * 2 - 1) * 26;        // -26..26
    const dy = -(14 + Math.random() * 34);          // -14..-48
    const rot = (Math.random() * 2 - 1) * 28;       // -28..28deg
    const scale = 0.8 + Math.random() * 0.55;       // 0.8..1.35
    const dur = 1100 + Math.random() * 650;         // 1100..1750ms
    const delay = Math.random() * 90;               // 0..90ms

    heart.style.setProperty("--dx", `${dx}px`);
    heart.style.setProperty("--dy", `${dy}px`);
    heart.style.setProperty("--rot", `${rot}deg`);
    heart.style.setProperty("--s", String(scale));
    heart.style.setProperty("--dur", `${dur}ms`);
    heart.style.setProperty("--delay", `${delay}ms`);

    layer.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove(), { once: true });
  }
}

export default function TubeteikaReaction({ trackSlug }) {
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const burstRef = useRef(null);

  useEffect(() => {
    const reactedKey = `toqibox:reacted:${trackSlug}`;
    const countKey = `toqibox:react:${trackSlug}`;

    setActive(localStorage.getItem(reactedKey) === "1");
    setCount(Number(localStorage.getItem(countKey) || "0"));
  }, [trackSlug]);

  function onClick() {
    // эффект всегда
    spawnHearts(burstRef.current);

    // счётчик только один раз
    if (active) return;

    const reactedKey = `toqibox:reacted:${trackSlug}`;
    const countKey = `toqibox:react:${trackSlug}`;

    localStorage.setItem(reactedKey, "1");

    const next = Number(localStorage.getItem(countKey) || "0") + 1;
    localStorage.setItem(countKey, String(next));

    setActive(true);
    setCount(next);
  }

  return (
    <div className="tr-wrap">
      <button
        className={`tr-btn ${active ? "is-active" : ""}`}
        onClick={onClick}
        aria-label="Поддержать трек"
        type="button"
      >
        <span className="tr-burst" ref={burstRef} aria-hidden="true" />
        <img className="tr-icon" src={tubeteikaReaction} alt="" />
      </button>

      {count > 0 && (
        <div className="tr-count" aria-hidden="true">
          {count}
        </div>
      )}
    </div>
  );
}
