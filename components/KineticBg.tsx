"use client";
import React from "react";

interface Props {
  accent: string;
  night: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function KineticBg({ accent, night, children, style }: Props) {
  const bg = night ? "#0a0a0a" : "#ffffff";
  const ink = night ? "#ffffff" : "#0a0a0a";

  return (
    <div
      style={{
        background: bg,
        color: ink,
        position: "relative",
        minHeight: "calc(100dvh - 64px)",
        fontFamily: "var(--font-archivo), system-ui, sans-serif",
        ...style,
      }}
    >
      {/* Halftone wash — top-left quadrant, fades to transparent */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          backgroundImage: `radial-gradient(${accent}${night ? "44" : "28"} 1.4px, transparent 1.7px)`,
          backgroundSize: "10px 10px",
          opacity: night ? 0.55 : 0.85,
          maskImage: "linear-gradient(135deg, #000 0%, transparent 65%)",
          WebkitMaskImage: "linear-gradient(135deg, #000 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Diagonal motion-line slash — top right */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -40,
          right: -60,
          width: 280,
          height: 600,
          background: `repeating-linear-gradient(-72deg, ${accent} 0 3px, transparent 3px 9px)`,
          opacity: night ? 0.18 : 0.09,
          transform: "rotate(2deg)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Content layer */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
