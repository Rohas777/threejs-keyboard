/** A unit of warm-up work; the queue starts the next one only after the returned promise settles. */
export type WarmUpTask = () => Promise<void>;

/** NOTE Upper bound for waiting on an idle period, so warm-up still runs on a page that never goes idle. */
const IDLE_TIMEOUT_MS = 2000;

const queue: WarmUpTask[] = [];
let isStarted = false;
let isDraining = false;
let holds = 0;
let onRelease: (() => void) | null = null;

function whenNotHeld(): Promise<void> {
    if (holds === 0) return Promise.resolve();
    return new Promise((resolve) => {
        onRelease = resolve;
    });
}

function whenIdle(): Promise<void> {
    return new Promise((resolve) => {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(() => resolve(), { timeout: IDLE_TIMEOUT_MS });
        } else {
            setTimeout(resolve, 0);
        }
    });
}

async function drain() {
    if (!isStarted || isDraining) return;
    isDraining = true;

    while (queue.length > 0) {
        await whenIdle();
        await whenNotHeld();
        const task = queue.shift();
        if (!task) continue;
        try {
            await task();
        } catch (error) {
            console.error('Warm-up task failed', error);
        }
    }

    isDraining = false;
}

/**
 * Queues work that prepares an off-screen part of the page (mounting a canvas, compiling shaders).
 * Tasks run one at a time, each in its own idle period, after {@link startWarmUp}.
 *
 * @param task - Work to run; the next task waits until its promise settles.
 * @returns Function that removes the task if it has not started yet.
 */
export function requestWarmUp(task: WarmUpTask): () => void {
    queue.push(task);
    void drain();

    return () => {
        const index = queue.indexOf(task);
        if (index !== -1) queue.splice(index, 1);
    };
}

/**
 * Keeps the queue from starting new tasks while a user-facing animation runs; a task already in progress finishes.
 *
 * @returns Function that releases the hold; calling it more than once has no further effect.
 */
export function holdWarmUp(): () => void {
    holds++;
    let isReleased = false;

    return () => {
        if (isReleased) return;
        isReleased = true;
        holds--;
        if (holds === 0 && onRelease) {
            const resume = onRelease;
            onRelease = null;
            resume();
        }
    };
}

/** Allows queued warm-up tasks to run; called once the critical intro work of the page is done. */
export function startWarmUp() {
    isStarted = true;
    void drain();
}
