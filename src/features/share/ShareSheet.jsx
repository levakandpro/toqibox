import React, { useEffect, useMemo, useState } from "react";

import whatsappIcon from "../../assets/share/whatsapp.svg";
import telegramIcon from "../../assets/share/telegram.svg";
import instagramIcon from "../../assets/share/instagram.svg";
import messengerIcon from "../../assets/share/FacebookMessenger.svg";
import copyIcon from "../../assets/share/Copylink.svg";

import "./shareSheet.css";

export default function ShareSheet({ open, onClose, url, title = "TOQIBOX" }) {
  const [toast, setToast] = useState("");

  const safeUrl = useMemo(() => url || window.location.href, [url]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const copyLink = async ({ silent = false } = {}) => {
    const okToast = "Ссылка скопирована";

    try {
      await navigator.clipboard.writeText(safeUrl);
      if (!silent) setToast(okToast);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = safeUrl;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        if (!silent) setToast(okToast);
        return true;
      } catch {
        if (!silent) setToast("Не удалось скопировать");
        return false;
      }
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n${safeUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareTelegram = () => {
    const u = encodeURIComponent(safeUrl);
    const t = encodeURIComponent(title);
    window.open(
      `https://t.me/share/url?url=${u}&text=${t}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // IMPORTANT: no sys share here (prevents "second share sheet" on phone)
  const shareInstagram = async () => {
    const copied = await copyLink({ silent: true });
    setToast(
      copied
        ? "Ссылка скопирована - вставь в Instagram"
        : "Не удалось скопировать"
    );
  };

  const shareMessenger = async () => {
    const copied = await copyLink({ silent: true });
    setToast(
      copied
        ? "Ссылка скопирована - вставь в Messenger"
        : "Не удалось скопировать"
    );
  };

  if (!open) return null;

  return (
    <div className="sh-overlay" onPointerDown={onClose}>
      <div
        className="sh-sheet"
        onPointerDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sh-grabber" />

        <div className="sh-row">
          <button
            type="button"
            className="sh-btn"
            onClick={shareWhatsApp}
            aria-label="WhatsApp"
          >
            <img src={whatsappIcon} alt="" />
          </button>

          <button
            type="button"
            className="sh-btn"
            onClick={shareTelegram}
            aria-label="Telegram"
          >
            <img src={telegramIcon} alt="" />
          </button>

          <button
            type="button"
            className="sh-btn"
            onClick={shareInstagram}
            aria-label="Instagram"
          >
            <img src={instagramIcon} alt="" />
          </button>

          <button
            type="button"
            className="sh-btn"
            onClick={shareMessenger}
            aria-label="Messenger"
          >
            <img src={messengerIcon} alt="" />
          </button>

          <button
            type="button"
            className="sh-btn"
            onClick={() => copyLink()}
            aria-label="Copy link"
          >
            <img src={copyIcon} alt="" />
          </button>
        </div>

        <button type="button" className="sh-close" onClick={onClose}>
          Закрыть
        </button>

        {toast ? <div className="sh-toast">{toast}</div> : null}
      </div>
    </div>
  );
}
