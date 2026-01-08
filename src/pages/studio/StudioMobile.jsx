import React, { useEffect } from "react";

const STUDIO_CSS = [
  "/studio/css/base.css",
  "/studio/css/studio.css",
  "/studio/css/studio-mobile.css",
];

function ensureLink(href) {
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.studio = "1";
  document.head.appendChild(link);
}

export default function StudioMobile() {
  useEffect(() => {
    STUDIO_CSS.forEach(ensureLink);
  }, []);

  return (
    <div className="studio-page">
      <header className="studio-header">
        <div className="logo">TOQIBOX</div>
        <div className="badge">STUDIO</div>
      </header>

      <main className="studio-root mobile">
        <section className="canvas-wrap">
          <div className="canvas canvas-9x16">
            <span>ПРЕДПРОСМОТР 9:16</span>
          </div>
        </section>

        <section className="controls">
          <button type="button">Загрузить аудио</button>
          <button type="button">Загрузить фото (9:16)</button>
          <button type="button" className="primary">Экспорт MP4</button>
        </section>
      </main>
    </div>
  );
}
