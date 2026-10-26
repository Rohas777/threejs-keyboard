import { requestWarmUp } from '@/lib/warmUp';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Takes a place in the page warm-up queue for an off-screen canvas.
 *
 * @returns `isDue` — the queue reached this canvas and it should mount now; `markWarm` — call once the scene
 * is compiled and rendered (or failed), which lets the queue move on. Calling it earlier, for a canvas that
 * mounted on its own, makes its queue turn finish immediately.
 */
export function useWarmUp() {
    const [isDue, setIsDue] = useState(false);
    const stateRef = useRef<{ isWarm: boolean; finish?: () => void }>({ isWarm: false });

    useEffect(() => {
        const state = stateRef.current;
        const cancel = requestWarmUp(
            () =>
                new Promise<void>((resolve) => {
                    if (state.isWarm) return resolve();
                    state.finish = resolve;
                    setIsDue(true);
                }),
        );

        return () => {
            cancel();
            state.finish?.();
            state.finish = undefined;
        };
    }, []);

    const markWarm = useCallback(() => {
        const state = stateRef.current;
        state.isWarm = true;
        state.finish?.();
        state.finish = undefined;
    }, []);

    return { isDue, markWarm };
}
