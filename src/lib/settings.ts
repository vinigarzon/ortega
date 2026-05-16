/**
 * Reescrito para leer desde Turso (tabla `settings`, k/v JSON).
 *
 * Mantiene la misma firma que la versión anterior (basada en getEntry):
 * cualquier .astro que llamaba `getSiteSettings()` sigue funcionando.
 */
import { getSetting } from "./queries";

export async function getSiteSettings() {
  const [site, seo, contact, footer, homepage] = await Promise.all([
    getSetting<any>("site"),
    getSetting<any>("seo"),
    getSetting<any>("contact"),
    getSetting<any>("footer"),
    getSetting<any>("homepage"),
  ]);

  return {
    site:      site?.site,
    seo:       seo?.seo,
    contact:   contact?.contact,
    social:    contact?.social,
    footer:    footer?.footer,
    homepage:  homepage?.homepage,
  };
}

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;
