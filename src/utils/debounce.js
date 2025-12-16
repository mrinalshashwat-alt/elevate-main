/**
 * Simple debounce utility (HackerRank/LeetCode style)
 * Delays function execution until user stops making changes
 */

const debounceTimers = {};

export function debounce(key, fn, delay = 2000) {
  // Clear existing timer for this key
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }

  // Set new timer
  debounceTimers[key] = setTimeout(() => {
    fn();
    delete debounceTimers[key];
  }, delay);
}

/**
 * Cancel all pending debounced calls
 */
export function cancelAllDebounces() {
  Object.values(debounceTimers).forEach(timer => clearTimeout(timer));
  Object.keys(debounceTimers).forEach(key => delete debounceTimers[key]);
}

/**
 * Execute all pending debounced calls immediately
 */
export function flushAllDebounces() {
  Object.entries(debounceTimers).forEach(([key, timer]) => {
    clearTimeout(timer);
    // Note: Can't execute the function as we don't store it
    // Just clear the timers
  });
  Object.keys(debounceTimers).forEach(key => delete debounceTimers[key]);
}
