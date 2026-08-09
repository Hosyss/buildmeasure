export const SITE_URL = "https://buildmeasure.hosys.chatgpt.site";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
