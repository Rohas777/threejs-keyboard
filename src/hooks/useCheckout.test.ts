// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCheckout } from './useCheckout';

describe('useCheckout', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('is pending until the checkout finishes', async () => {
        const { result } = renderHook(() => useCheckout());
        expect(result.current.isPending).toBe(false);

        let checkout: Promise<void> | undefined;
        act(() => {
            checkout = result.current.checkout();
        });
        expect(result.current.isPending).toBe(true);

        await act(async () => {
            await vi.runAllTimersAsync();
            await checkout;
        });
        expect(result.current.isPending).toBe(false);
    });

    it('ignores repeated calls while a checkout is pending', async () => {
        const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
        const { result } = renderHook(() => useCheckout());

        act(() => {
            void result.current.checkout();
            void result.current.checkout();
        });
        act(() => {
            void result.current.checkout();
        });

        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
        await act(() => vi.runAllTimersAsync());
    });
});
