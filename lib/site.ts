export const SITE_URL = "https://buildmeasure.buildtools.workers.dev";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
