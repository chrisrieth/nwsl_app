const KEY = "nwsl_favorite_team";

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
}
