import React from "react";

export default function Button({ className = "", children, ...props }) {
  return (
    <button className={`ui-btn ${className}`} {...props}>
      {children}
    </button>
  );
}
