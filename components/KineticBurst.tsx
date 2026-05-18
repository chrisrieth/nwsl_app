"use client";
import type { CSSProperties } from "react";

interface Props {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export default function KineticBurst({ size = 80, color = "#FF2D55", style }: Props) {
  const spikes = 16;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = (i % 2 === 0 ? 0.5 : 0.34) * size;
    const ang = (i / (spikes * 2)) * Math.PI * 2;
    pts.push(`${size / 2 + Math.cos(ang) * r},${size / 2 + Math.sin(ang) * r}`);
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={style}
      aria-hidden
    >
      <polygon
        points={pts.join(" ")}
        fill={color}
        stroke="#0a0a0a"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
