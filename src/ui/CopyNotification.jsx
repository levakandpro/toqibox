import React, { useEffect, useState } from "react";

export default function CopyNotification({ show, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "40px",
        left: "50%",
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(20px)",
        background: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "12px",
        padding: "12px 20px",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 600,
        zIndex: 10000,
        opacity: visible ? 1 : 0,
        transition: "all 0.3s ease",
        pointerEvents: "none",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
      }}
    >
      Ссылка скопирована
    </div>
  );
}

