// Debounce utility for robust event handling
// Citation: https://lodash.com/docs/4.17.15#debounce
// Improved debounce utility with proper types
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function(this: unknown, ...args: unknown[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args as Parameters<T>), delay);
  } as T;
}
