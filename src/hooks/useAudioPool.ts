import { createAudioPool } from '@/lib/sound';
import { useEffect, useRef } from 'react';

/**
 * Lazily created pool of audio elements for the given sources, rebuilt when the sources change.
 *
 * @returns Getter of a random element from the pool; creates the pool on first call (client only).
 */
export function useAudioPool(sources: readonly string[], volume: number) {
    const poolRef = useRef<{ sources: readonly string[]; audio: HTMLAudioElement[] } | null>(null);

    useEffect(
        () => () => {
            poolRef.current?.audio.forEach((audio) => audio.pause());
            poolRef.current = null;
        },
        [sources],
    );

    return () => {
        if (poolRef.current?.sources !== sources) {
            poolRef.current = { sources, audio: createAudioPool(sources, volume) };
        }
        const { audio } = poolRef.current;
        return audio[Math.floor(Math.random() * audio.length)];
    };
}
