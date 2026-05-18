const KEY = "nwsl_favorite_team";
const COLOR_KEY = "nwsl_favorite_color";
const ABBR_KEY = "nwsl_favorite_abbr";

export function getFavoriteTeam(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setFavoriteTeam(teamId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, teamId);
}

export function clearFavoriteTeam(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(COLOR_KEY);
  localStorage.removeItem(ABBR_KEY);
}

// primaryHex: ESPN color field value — no leading #.
export function setFavoriteMeta(abbr: string, primaryHex: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ABBR_KEY, abbr);
  localStorage.setItem(COLOR_KEY, primaryHex);
}

export function getFavoriteAbbr(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ABBR_KEY);
}

export function getFavoriteColor(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COLOR_KEY);
}
