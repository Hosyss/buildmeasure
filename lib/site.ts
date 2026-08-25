export const SITE_URL = "https://buildnumbers.pages.dev";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
