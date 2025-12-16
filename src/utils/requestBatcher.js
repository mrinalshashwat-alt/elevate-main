/**
 * Smart request batcher with exponential backoff
 *
 * Handles:
 * - Batching multiple requests into single API calls
 * - Exponential backoff retry for 429 errors
 * - Debouncing to reduce request frequency
 */

class RequestBatcher {
  constructor() {
    this.violationQueue = [];
    this.saveQueue = new Map(); // questionId -> answer
    this.violationTimer = null;
    this.saveTimer = null;
    this.retryDelays = new Map(); // endpoint -> current delay
  }

  /**
   * Batch violations - collect and send every 3 seconds
   */
  queueViolation(attemptId, violation, sendFn) {
    this.violationQueue.push({ attemptId, violation });

    // Clear existing timer
    if (this.violationTimer) {
      clearTimeout(this.violationTimer);
    }

    // Send batch after 3 seconds, or immediately if queue is large
    const delay = this.violationQueue.length >= 5 ? 0 : 3000;

    this.violationTimer = setTimeout(async () => {
      await this.flushViolations(sendFn);
    }, delay);
  }

  /**
   * Flush all queued violations in a batch
   */
  async flushViolations(sendFn) {
    if (this.violationQueue.length === 0) return;

    const batch = [...this.violationQueue];
    this.violationQueue = [];

    // Group by attempt ID
    const grouped = batch.reduce((acc, { attemptId, violation }) => {
      if (!acc[attemptId]) acc[attemptId] = [];
      acc[attemptId].push(violation);
      return acc;
    }, {});

    // Send each group
    for (const [attemptId, violations] of Object.entries(grouped)) {
      for (const violation of violations) {
        try {
          await this.retryWithBackoff(`violation-${attemptId}`, () => sendFn(attemptId, violation));
        } catch (err) {
          console.error('Failed to send violation after retries:', err);
        }
      }
    }
  }

  /**
   * Debounce saves - wait 2 seconds after last change
   */
  debounceSave(attemptId, questionId, answer, saveFn) {
    // Add to queue
    this.saveQueue.set(questionId, { attemptId, answer });

    // Clear existing timer
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // Flush after 2 seconds of inactivity
    this.saveTimer = setTimeout(async () => {
      await this.flushSaves(saveFn);
    }, 2000);
  }

  /**
   * Flush all queued saves
   */
  async flushSaves(saveFn) {
    if (this.saveQueue.size === 0) return;

    const saves = Array.from(this.saveQueue.entries());
    this.saveQueue.clear();

    // Send all saves
    for (const [questionId, { attemptId, answer }] of saves) {
      try {
        await this.retryWithBackoff(`save-${attemptId}-${questionId}`, () =>
          saveFn(attemptId, { question_id: questionId, answer })
        );
      } catch (err) {
        console.error('Failed to save after retries:', questionId, err);
        // Add to failed queue for later retry
        const failedQueue = JSON.parse(localStorage.getItem('assessment_failed_saves') || '[]');
        failedQueue.push({
          question_id: questionId,
          answer: answer,
          timestamp: Date.now(),
          attempt_count: 1
        });
        localStorage.setItem('assessment_failed_saves', JSON.stringify(failedQueue));
      }
    }
  }

  /**
   * Execute function with exponential backoff retry on 429 errors
   */
  async retryWithBackoff(key, fn, maxRetries = 3) {
    let delay = this.retryDelays.get(key) || 1000; // Start with 1 second

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();

        // Success - reset delay
        this.retryDelays.delete(key);
        return result;

      } catch (error) {
        // Check if it's a 429 error
        const is429 = error?.response?.status === 429;

        if (!is429 || attempt === maxRetries) {
          // Not a rate limit error, or max retries exceeded
          throw error;
        }

        // Wait with exponential backoff
        console.log(`⏳ Rate limited (429), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Exponential backoff: 1s, 2s, 4s, 8s...
        delay *= 2;
        this.retryDelays.set(key, delay);

        // Cap at 30 seconds
        if (delay > 30000) delay = 30000;
      }
    }
  }

  /**
   * Force flush all pending requests (e.g., before navigation)
   */
  async flushAll(sendViolationFn, saveFn) {
    await Promise.all([
      this.flushViolations(sendViolationFn),
      this.flushSaves(saveFn)
    ]);
  }

  /**
   * Clear all queues
   */
  clear() {
    this.violationQueue = [];
    this.saveQueue.clear();
    if (this.violationTimer) clearTimeout(this.violationTimer);
    if (this.saveTimer) clearTimeout(this.saveTimer);
  }
}

// Singleton instance
export const requestBatcher = new RequestBatcher();
