import { useEffect, useRef } from 'react';

export const useInterval = (callback, delay, condition) => {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null && condition) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay, condition]);
}