
export const MAX_INVITATION_ATTEMPTS = 5;

const BASE_DELAY_MS = 60_000;
const MAX_DELAY_MS = 15 * 60_000;

export function calculateNextAttemptAt(
  attempts: number,
  now: Date,
): Date | null {
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new Error('attempts must be a positive integer.');
  }

  if (attempts >= MAX_INVITATION_ATTEMPTS) {
    return null;
  }

  const delayMs = Math.min(
    BASE_DELAY_MS * 2 ** (attempts - 1),
    MAX_DELAY_MS,
  );

  return new Date(now.getTime() + delayMs);
}
