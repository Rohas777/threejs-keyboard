const STORAGE_KEY = 'nimbus:scroll-y';
const LOCK_ATTRIBUTE = 'data-scroll-locked';

let initialScrollY: number | undefined;

function hashTargetY(): number | null {
    if (!location.hash) return null;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return null;
    const scrollMargin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    return target.getBoundingClientRect().top + window.scrollY - scrollMargin;
}

function savedScrollY(): number {
    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigation?.type !== 'reload' && navigation?.type !== 'back_forward') return 0;
    const saved = Number(sessionStorage.getItem(STORAGE_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
}

/**
 * Scroll position the page should open at: the URL hash target, the position saved before a reload or
 * history navigation, or `0` for a fresh visit. Computed once per page load, so every caller sees the same value.
 *
 * @returns Vertical scroll offset in pixels.
 */
export function getInitialScrollY(): number {
    initialScrollY ??= hashTargetY() ?? savedScrollY();
    return initialScrollY;
}

/**
 * Takes over scroll restoration: scrolls to {@link getInitialScrollY} and saves the position when the page is hidden.
 *
 * @returns Cleanup that stops saving the position.
 */
export function restoreScrollPosition(): () => void {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, getInitialScrollY());

    const save = () => sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
}

/**
 * Releases the scroll lock that the server-rendered `<html>` starts with.
 * LINK src/app/layout.tsx
 */
export function unlockScroll() {
    document.documentElement.removeAttribute(LOCK_ATTRIBUTE);
}
