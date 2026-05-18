"use client";
import { useEffect, useState } from "react";

export function useNight(): boolean {
  const [night, setNight] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setNight(mq.matches);
    const h = (e: MediaQueryListEvent) => setNight(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return night;
}
