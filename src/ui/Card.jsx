import React from "react";

export default function Card({ className = "", children }) {
  return <div className={`ui-card ${className}`}>{children}</div>;
}
