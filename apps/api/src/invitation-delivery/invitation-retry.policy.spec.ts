
import { describe, expect, it } from 'vitest';

import {
  calculateNextAttemptAt,
  MAX_INVITATION_ATTEMPTS,
} from './invitation-retry.policy.js';

describe('Invitation retry policy', () => {
  const now = new Date('2026-11-10T12:00:00.000Z');

  it.each([
    [1, 1],
    [2, 2],
    [3, 4],
    [4, 8],
  ])(
    'schedules attempt %i failure after %i minutes',
    (attempts, delayMinutes) => {
      const nextAttemptAt = calculateNextAttemptAt(
        attempts,
        now,
      );

      expect(nextAttemptAt?.getTime()).toBe(
        now.getTime() + delayMinutes * 60_000,
      );
    },
  );

  it('stops retrying after the maximum attempts', () => {
    expect(
      calculateNextAttemptAt(MAX_INVITATION_ATTEMPTS, now),
    ).toBeNull();

    expect(
      calculateNextAttemptAt(MAX_INVITATION_ATTEMPTS + 1, now),
    ).toBeNull();
  });

  it('rejects invalid attempt counts', () => {
    expect(() => calculateNextAttemptAt(0, now)).toThrow();
    expect(() => calculateNextAttemptAt(-1, now)).toThrow();
    expect(() => calculateNextAttemptAt(1.5, now)).toThrow();
  });
});
