// Platform admins are the Callen team (not a restaurant's own admins).
// They fulfil things customers can't do themselves yet, such as entering
// the phone number Uplift assigned to a request. Set PLATFORM_ADMIN_EMAILS
// to a comma-separated list of login emails.

import "server-only";

export function isPlatformAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
