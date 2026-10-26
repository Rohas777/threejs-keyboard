// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type NavigationType = 'navigate' | 'reload' | 'back_forward';

async function loadScrollModule(navigationType: NavigationType) {
    vi.resetModules();
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        { type: navigationType } as unknown as PerformanceEntry,
    ]);
    return import('./scroll');
}

describe('getInitialScrollY', () => {
    beforeEach(() => {
        sessionStorage.clear();
        history.replaceState(null, '', '/');
        document.body.innerHTML = '';
    });
    afterEach(() => vi.restoreAllMocks());

    it('starts at the top on a fresh visit even with a saved position', async () => {
        sessionStorage.setItem('nimbus:scroll-y', '1200');
        const { getInitialScrollY } = await loadScrollModule('navigate');
        expect(getInitialScrollY()).toBe(0);
    });

    it('returns the saved position after a reload', async () => {
        sessionStorage.setItem('nimbus:scroll-y', '1200');
        const { getInitialScrollY } = await loadScrollModule('reload');
        expect(getInitialScrollY()).toBe(1200);
    });

    it('returns the saved position after history navigation', async () => {
        sessionStorage.setItem('nimbus:scroll-y', '640');
        const { getInitialScrollY } = await loadScrollModule('back_forward');
        expect(getInitialScrollY()).toBe(640);
    });

    it('ignores invalid saved values', async () => {
        sessionStorage.setItem('nimbus:scroll-y', 'not-a-number');
        const { getInitialScrollY } = await loadScrollModule('reload');
        expect(getInitialScrollY()).toBe(0);
    });

    it('prefers the URL hash target over the saved position', async () => {
        sessionStorage.setItem('nimbus:scroll-y', '1200');
        document.body.innerHTML = '<h2 id="features"></h2>';
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 900 } as DOMRect);
        history.replaceState(null, '', '/#features');

        const { getInitialScrollY } = await loadScrollModule('reload');
        expect(getInitialScrollY()).toBe(900);
    });

    it('keeps the first computed value for the whole page load', async () => {
        sessionStorage.setItem('nimbus:scroll-y', '1200');
        const { getInitialScrollY } = await loadScrollModule('reload');
        expect(getInitialScrollY()).toBe(1200);

        sessionStorage.setItem('nimbus:scroll-y', '50');
        expect(getInitialScrollY()).toBe(1200);
    });
});

describe('scroll lock', () => {
    afterEach(() => vi.restoreAllMocks());

    it('removes the lock attribute from <html>', async () => {
        const { unlockScroll } = await loadScrollModule('navigate');
        document.documentElement.setAttribute('data-scroll-locked', '');

        unlockScroll();

        expect(document.documentElement.hasAttribute('data-scroll-locked')).toBe(false);
    });

    it('restores the initial position and saves the current one when the page is hidden', async () => {
        sessionStorage.setItem('nimbus:scroll-y', '300');
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        const { restoreScrollPosition } = await loadScrollModule('reload');

        const stop = restoreScrollPosition();
        expect(scrollTo).toHaveBeenCalledWith(0, 300);
        expect(history.scrollRestoration).toBe('manual');

        Object.defineProperty(window, 'scrollY', { value: 750, configurable: true });
        window.dispatchEvent(new Event('pagehide'));
        expect(sessionStorage.getItem('nimbus:scroll-y')).toBe('750');

        stop();
        Object.defineProperty(window, 'scrollY', { value: 10, configurable: true });
        window.dispatchEvent(new Event('pagehide'));
        expect(sessionStorage.getItem('nimbus:scroll-y')).toBe('750');
    });
});
