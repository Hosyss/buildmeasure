export const SITE_URL = "https://buildmeasure.hosy-sthdr.workers.dev";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
