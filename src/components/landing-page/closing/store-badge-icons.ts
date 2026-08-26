import appStore from "thesvg/app-store";
import googlePlay from "thesvg/google-play";

const PATH_D_PATTERN = /<path[^>]*\sd="([^"]+)"/;

function extractPathD(svgMarkup: string, label: string): string {
  const match = svgMarkup.match(PATH_D_PATTERN);
  if (!match) {
    throw new Error(
      `store-badge-icons: could not extract path "d" from ${label} mono variant`,
    );
  }
  return match[1];
}

const APP_STORE_PATH_D = extractPathD(appStore.variants.mono, "app-store");
const GOOGLE_PLAY_PATH_D = extractPathD(
  googlePlay.variants.mono,
  "google-play",
);

export { APP_STORE_PATH_D, GOOGLE_PLAY_PATH_D };
