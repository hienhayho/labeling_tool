/**
 * A custom hook that ensures the provided callback is executed safely within a `useEffect` hook.
 * This hook prevents the `useEffect` callback from being called twice in development strict mode by using a timeout.
 *
 * @param callback - The callback function to be executed. It can be a synchronous or asynchronous function.
 * @param deps - An optional array of dependencies that the effect depends on. The effect will re-run when any of these dependencies change.
 */
import { useEffect } from "react";

export const useEffectSafe = (
  callback: () => void | Promise<void>,
  deps?: unknown[],
) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      callback();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
