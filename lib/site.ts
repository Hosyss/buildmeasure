export const SITE_URL = "https://jobsitequant.pages.dev";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
