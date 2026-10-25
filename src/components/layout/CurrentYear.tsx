'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();
const getServerYear = () => null;

/**
 * Current year from the visitor's clock. Renders nothing in the static HTML, so a page built in a previous
 * year never shows a stale value or causes a hydration mismatch.
 */
export function CurrentYear() {
    return useSyncExternalStore(subscribe, getYear, getServerYear);
}
