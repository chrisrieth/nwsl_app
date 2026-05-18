"use client";
import React from "react";

interface Props {
  accent: string;
  inverse?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function KineticBanner({ accent, inverse = false, children, style }: Props) {
  return (
    <div style={{ position: "relative", ...style }}>
      {/* Shadow offset */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "4px -4px -4px 4px",
          background: "#0a0a0a",
          clipPath: "polygon(0 0, 100% 8%, 96% 100%, 4% 92%)",
        }}
      />
      {/* Banner face */}
      <div
        style={{
          position: "relative",
          background: inverse ? "#0a0a0a" : accent,
          color: inverse ? accent : "#0a0a0a",
          padding: "10px 22px",
          clipPath: "polygon(0 0, 100% 8%, 96% 100%, 4% 92%)",
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {children}
      </div>
    </div>
  );
}
