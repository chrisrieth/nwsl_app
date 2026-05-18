// Neon accent colors for dark mode, keyed by ESPN team abbreviation.
// Falls back to the team's primary color if the abbreviation isn't mapped.
const NEON: Record<string, string> = {
  POR: "#FF2D55",
  KC: "#FFD60A", KCC: "#FFD60A",
  ACFC: "#FF4D8D", LA: "#FF4D8D",
  NC: "#3A86FF", NCC: "#3A86FF",
  WASH: "#FF3344", WAS: "#FF3344", WSP: "#FF3344",
  SD: "#00E5FF", SDW: "#00E5FF",
  SEA: "#B14AED", SER: "#B14AED",
  ORL: "#A855F7",
  NJ: "#FF00AA", GOT: "#FF00AA", NJG: "#FF00AA",
  BAY: "#36A2FF",
  HOU: "#FF7A1A",
  CHI: "#FF3B30",
  LOU: "#C77DFF", RL: "#C77DFF",
  UTA: "#FFD60A",
};

// primaryHex is the ESPN color field value (no leading #).
export function getNeonColor(abbr: string, primaryHex: string): string {
  return NEON[abbr.toUpperCase()] ?? `#${primaryHex}`;
}

export function getTeamAccent(abbr: string, primaryHex: string, night: boolean): string {
  return night ? getNeonColor(abbr, primaryHex) : `#${primaryHex}`;
}
