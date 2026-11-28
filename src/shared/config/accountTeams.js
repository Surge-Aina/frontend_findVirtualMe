export function isAccountTeamsEnabled() {
  return import.meta.env.VITE_ACCOUNT_TEAMS_ENABLED === "true";
}