import axios from 'axios';

/**
 * Home has no failures of its own: it reads what other modules own, so a `{ code,
 * message }` from the API travels up as a plain error and the screen offers retry.
 */
export function mapApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return new Error(data?.message ?? error.message);
  }
  return error instanceof Error ? error : new Error('Network error');
}
