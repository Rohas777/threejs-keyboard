import { useRef, useState } from 'react';

/** Shared checkout action for every "Buy" button; `isPending` is true while a checkout is in progress. */
export function useCheckout() {
    const [isPending, setIsPending] = useState(false);
    const isPendingRef = useRef(false);

    const checkout = async () => {
        if (isPendingRef.current) return;
        isPendingRef.current = true;
        setIsPending(true);
        try {
            // STUB Replace with a server-side checkout session (server-computed price, idempotency key) and a redirect to the URL it returns.
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } finally {
            isPendingRef.current = false;
            setIsPending(false);
        }
    };

    return { checkout, isPending };
}
