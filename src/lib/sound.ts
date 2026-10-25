/**
 * Starts playback and reports failures except `AbortError`, which the browser raises when a later
 * `pause()` interrupts a pending `play()` — an expected outcome for short click sounds.
 *
 * @param audio - Element to play.
 * @returns Promise that settles once playback starts or fails.
 */
export function playAudio(audio: HTMLAudioElement): Promise<void> {
    return audio.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Audio playback failed', error);
    });
}

/**
 * Creates one preloaded audio element per source.
 *
 * @param sources - Audio URLs.
 * @param volume - Volume in the `[0, 1]` range.
 * @returns Audio elements in the order of `sources`.
 */
export function createAudioPool(sources: readonly string[], volume: number): HTMLAudioElement[] {
    return sources.map((source) => {
        const audio = new Audio(source);
        audio.preload = 'auto';
        audio.volume = volume;
        return audio;
    });
}
