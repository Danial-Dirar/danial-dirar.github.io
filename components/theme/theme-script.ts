/**
 * Anti-FOUC theme correction.
 *
 * The server already renders <html class="dark"> because dark is the default,
 * so a visitor who has never touched the toggle gets dark in the very first
 * painted frame with no script involved at all. This script only runs the
 * correction for the minority who explicitly chose light.
 *
 * It must be emitted as a plain inline <script> in the server layout's <head>
 * so it executes synchronously before the body paints. `next/script` with
 * `strategy="beforeInteractive"` is NOT equivalent: it queues the code onto
 * `self.__next_s` for the Next runtime to run later, which is after first
 * paint — that is what used to make the site flash light on load.
 */
export const THEME_STORAGE_KEY = "theme";

export const themeInitScript = `(function(){try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='light'){var e=document.documentElement;e.classList.remove('dark');e.style.colorScheme='light';}}catch(e){}})();`;
