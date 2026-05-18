"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      background: "var(--bg, #0a0a0a)", color: "var(--ink, #ffffff)",
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 24px",
      fontFamily: "var(--font-archivo), system-ui, sans-serif",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 40, marginBottom: 16, transform: "skew(-6deg)", display: "inline-block" }}>!</div>
      <div style={{ fontSize: 20, marginBottom: 8, letterSpacing: "0.04em" }}>SOMETHING WENT WRONG</div>
      <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 32, letterSpacing: "0.08em" }}>
        CHECK YOUR CONNECTION AND TRY AGAIN
      </div>
      <button
        onClick={reset}
        style={{
          padding: "10px 28px",
          background: "#FF2D55", color: "#0a0a0a",
          border: "none", cursor: "pointer",
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: 13, letterSpacing: "0.12em",
          clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
        }}
      >TRY AGAIN</button>
    </div>
  );
}
