import { MOTION_REDUCED } from '@/lib/gsap';
import { getInitialScrollY } from '@/lib/scroll';

let playsIntro: boolean | undefined;

/**
 * Whether the hero plays its intro on this page load: only for a visit that opens at the top of the page
 * without a reduced-motion preference. Computed once, so the scene and the section always agree.
 */
export function shouldPlayIntro(): boolean {
    playsIntro ??= getInitialScrollY() === 0 && !window.matchMedia(MOTION_REDUCED).matches;
    return playsIntro;
}

/** Keyboard pose at the end of the intro; the scroll animation starts from it. */
export const INTRO_END_POSE = {
    position: { x: 0.2, y: -0.5, z: 1.8 },
    rotation: { x: 1.6, y: 0.4, z: 0 },
};
