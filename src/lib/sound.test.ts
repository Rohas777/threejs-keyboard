// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAudioPool, playAudio } from './sound';

describe('playAudio', () => {
    afterEach(() => vi.restoreAllMocks());

    it('ignores AbortError raised by an interrupting pause()', async () => {
        const audio = new Audio();
        vi.spyOn(audio, 'play').mockRejectedValue(new DOMException('interrupted', 'AbortError'));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        await playAudio(audio);

        expect(consoleError).not.toHaveBeenCalled();
    });

    it('reports other playback failures', async () => {
        const audio = new Audio();
        const failure = new DOMException('blocked', 'NotAllowedError');
        vi.spyOn(audio, 'play').mockRejectedValue(failure);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        await playAudio(audio);

        expect(consoleError).toHaveBeenCalledWith('Audio playback failed', failure);
    });
});

describe('createAudioPool', () => {
    it('creates one preloaded element per source with the given volume', () => {
        const pool = createAudioPool(['/a.mp3', '/b.mp3'], 0.6);

        expect(pool.map((audio) => new URL(audio.src).pathname)).toEqual(['/a.mp3', '/b.mp3']);
        expect(pool.every((audio) => audio.volume === 0.6 && audio.preload === 'auto')).toBe(true);
    });
});
