import { useEffect, useRef } from "react";

/**
 * Класс TextScramble для эффекта скремблирования текста
 * Адаптирован из CodePen: https://codepen.io/soulwire/pen/mEMPrK
 */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

/**
 * React компонент для эффекта TextScramble
 */
export default function TextScrambleEffect({ text, className = "" }) {
  const textRef = useRef(null);
  const scrambleRef = useRef(null);

  useEffect(() => {
    if (!textRef.current || !text) return;

    if (!scrambleRef.current) {
      scrambleRef.current = new TextScramble(textRef.current);
    }

    scrambleRef.current.setText(text);

    return () => {
      if (scrambleRef.current && scrambleRef.current.frameRequest) {
        cancelAnimationFrame(scrambleRef.current.frameRequest);
      }
    };
  }, [text]);

  useEffect(() => {
    // Загружаем шрифт Roboto Mono
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css?family=Roboto+Mono:100";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        .text-scramble {
          font-family: 'Roboto Mono', monospace;
          font-weight: 100;
          font-size: clamp(12px, 3.5vw, 14px);
          color: #FAFAFA;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          text-align: center;
          position: relative;
          margin: 0;
          padding: 0 8px;
          box-sizing: border-box;
        }
        .text-scramble .dud {
          color: #757575;
        }
      `}</style>
      <div className={`text-scramble ${className}`} ref={textRef}></div>
    </>
  );
}

