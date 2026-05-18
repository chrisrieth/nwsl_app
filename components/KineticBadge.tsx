"use client";

interface Props {
  abbr: string;
  accent: string;
  size?: number;
  rotate?: number;
  night?: boolean;
}

export default function KineticBadge({ abbr, accent, size = 44, rotate = -6, night = false }: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {/* Shadow offset */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "#0a0a0a",
          clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
          transform: "translate(3px, 3px)",
        }}
      />
      {/* Badge face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: accent,
          color: "#0a0a0a",
          clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: size * 0.32,
          fontWeight: 900,
          letterSpacing: "0.02em",
          boxShadow: night ? `0 0 ${size / 2}px ${accent}66` : "none",
        }}
      >
        {abbr.slice(0, 3)}
      </div>
    </div>
  );
}
