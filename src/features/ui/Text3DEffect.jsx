import React from "react";

/**
 * Компонент 3D текстового эффекта
 * Точная копия эффекта из CodePen: https://codepen.io/ryandsouza13/pen/yEBJQV
 * Прозрачный фон, только CSS/HTML эффект
 */
export default function Text3DEffect({ 
  text = "TOQIBOX", 
  textColor = "#ffffff",
  fontSize = "clamp(32px, 8vw, 140px)"
}) {
  return (
    <>
      <style>{`
        .text-3d-wrapper {
          position: relative;
          display: inline-block;
          background: transparent;
          padding: 0;
          margin: 0;
          perspective: 1000px;
          perspective-origin: center center;
          width: 100%;
          text-align: center;
          overflow: visible;
        }

        .text-3d {
          font-family: 'Arial Black', 'Helvetica Neue', Arial, sans-serif;
          font-size: ${fontSize};
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: clamp(0.08em, 1.5vw, 0.15em);
          color: ${textColor};
          position: relative;
          margin: 0;
          padding: 0 8px;
          background: transparent;
          display: inline-block;
          line-height: 1.1;
          transform-style: preserve-3d;
          transform: perspective(1000px) rotateX(15deg);
          text-shadow: 
            0 1px 0 #cccccc,
            0 2px 0 #c9c9c9,
            0 3px 0 #bbbbbb,
            0 4px 0 #b9b9b9,
            0 5px 0 #aaaaaa,
            0 6px 1px rgba(0, 0, 0, 0.1),
            0 0 5px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.3),
            0 3px 5px rgba(0, 0, 0, 0.2),
            0 5px 10px rgba(0, 0, 0, 0.25),
            0 10px 10px rgba(0, 0, 0, 0.2),
            0 20px 20px rgba(0, 0, 0, 0.15),
            0 30px 30px rgba(0, 0, 0, 0.1);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          white-space: nowrap;
          box-sizing: border-box;
          overflow: visible;
        }

        @media (max-width: 768px) {
          .text-3d-wrapper {
            overflow: visible;
            min-height: auto;
          }

          .text-3d {
            font-size: ${fontSize.includes('16px') ? 'clamp(18px, 4vw, 28px)' : 'clamp(28px, 10vw, 56px)'};
            letter-spacing: clamp(0.05em, 1vw, 0.12em);
            transform: perspective(800px) rotateX(10deg);
            text-shadow: 
              0 1px 0 #cccccc,
              0 2px 0 #c9c9c9,
              0 3px 0 #bbbbbb,
              0 4px 0 #b9b9b9,
              0 5px 0 #aaaaaa,
              0 6px 1px rgba(0, 0, 0, 0.1),
              0 0 5px rgba(0, 0, 0, 0.1),
              0 1px 3px rgba(0, 0, 0, 0.3),
              0 3px 5px rgba(0, 0, 0, 0.2),
              0 5px 10px rgba(0, 0, 0, 0.25),
              0 10px 10px rgba(0, 0, 0, 0.2);
            padding: 0 12px;
            white-space: normal;
            word-break: break-word;
            line-height: 1.2;
            overflow: visible;
          }

          .text-3d::before {
            transform: translateZ(-40px) scale(1.03);
          }
        }

        @media (max-width: 480px) {
          .text-3d-wrapper {
            overflow: visible;
            min-height: auto;
          }

          .text-3d {
            font-size: ${fontSize.includes('16px') ? 'clamp(18px, 4vw, 28px)' : 'clamp(24px, 12vw, 48px)'};
            letter-spacing: clamp(0.03em, 0.8vw, 0.1em);
            transform: perspective(600px) rotateX(8deg);
            padding: 0 16px;
            white-space: normal;
            word-break: break-word;
            line-height: 1.2;
            overflow: visible;
          }
        }

        .text-3d::before {
          content: '${text}';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: rgba(255, 255, 255, 0.15);
          transform: translateZ(-60px) scale(1.05);
          transform-origin: center bottom;
          z-index: -1;
          text-shadow: none;
          opacity: 0.8;
        }

      `}</style>
      <div className="text-3d-wrapper">
        <h1 className="text-3d">{text}</h1>
      </div>
    </>
  );
}
