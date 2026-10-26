// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadWarmUp() {
    vi.resetModules();
    return import('./warmUp');
}

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => (resolve = r));
    return { promise, resolve };
}

describe('warm-up queue', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('waits for startWarmUp before running tasks', async () => {
        const { requestWarmUp, startWarmUp } = await loadWarmUp();
        const task = vi.fn(() => Promise.resolve());

        requestWarmUp(task);
        await vi.runAllTimersAsync();
        expect(task).not.toHaveBeenCalled();

        startWarmUp();
        await vi.runAllTimersAsync();
        expect(task).toHaveBeenCalledOnce();
    });

    it('runs tasks one at a time in queue order', async () => {
        const { requestWarmUp, startWarmUp } = await loadWarmUp();
        const first = deferred();
        const calls: string[] = [];

        requestWarmUp(() => {
            calls.push('first');
            return first.promise;
        });
        requestWarmUp(() => {
            calls.push('second');
            return Promise.resolve();
        });
        startWarmUp();

        await vi.runAllTimersAsync();
        expect(calls).toEqual(['first']);

        first.resolve();
        await vi.runAllTimersAsync();
        expect(calls).toEqual(['first', 'second']);
    });

    it('skips a task cancelled before it started', async () => {
        const { requestWarmUp, startWarmUp } = await loadWarmUp();
        const cancelled = vi.fn(() => Promise.resolve());
        const kept = vi.fn(() => Promise.resolve());

        const cancel = requestWarmUp(cancelled);
        requestWarmUp(kept);
        cancel();
        startWarmUp();
        await vi.runAllTimersAsync();

        expect(cancelled).not.toHaveBeenCalled();
        expect(kept).toHaveBeenCalledOnce();
    });

    it('continues after a failed task', async () => {
        const { requestWarmUp, startWarmUp } = await loadWarmUp();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const next = vi.fn(() => Promise.resolve());

        requestWarmUp(() => Promise.reject(new Error('boom')));
        requestWarmUp(next);
        startWarmUp();
        await vi.runAllTimersAsync();

        expect(next).toHaveBeenCalledOnce();
        expect(console.error).toHaveBeenCalledWith('Warm-up task failed', expect.any(Error));
    });

    it('waits while held and resumes after every hold is released', async () => {
        const { requestWarmUp, startWarmUp, holdWarmUp } = await loadWarmUp();
        const task = vi.fn(() => Promise.resolve());

        const releaseFirst = holdWarmUp();
        const releaseSecond = holdWarmUp();
        requestWarmUp(task);
        startWarmUp();
        await vi.runAllTimersAsync();
        expect(task).not.toHaveBeenCalled();

        releaseFirst();
        releaseFirst();
        await vi.runAllTimersAsync();
        expect(task).not.toHaveBeenCalled();

        releaseSecond();
        await vi.runAllTimersAsync();
        expect(task).toHaveBeenCalledOnce();
    });

    it('lets a task that already started finish while held', async () => {
        const { requestWarmUp, startWarmUp, holdWarmUp } = await loadWarmUp();
        const running = deferred();
        const next = vi.fn(() => Promise.resolve());

        requestWarmUp(() => running.promise);
        requestWarmUp(next);
        startWarmUp();
        await vi.runAllTimersAsync();

        const release = holdWarmUp();
        running.resolve();
        await vi.runAllTimersAsync();
        expect(next).not.toHaveBeenCalled();

        release();
        await vi.runAllTimersAsync();
        expect(next).toHaveBeenCalledOnce();
    });

    it('uses idle callbacks when the browser provides them', async () => {
        const requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 50 });
            return 1;
        });
        vi.stubGlobal('requestIdleCallback', requestIdleCallback);
        const { requestWarmUp, startWarmUp } = await loadWarmUp();
        const task = vi.fn(() => Promise.resolve());

        requestWarmUp(task);
        startWarmUp();
        await vi.runAllTimersAsync();

        expect(requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 2000 });
        expect(task).toHaveBeenCalledOnce();
        vi.unstubAllGlobals();
    });
});
