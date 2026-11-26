/**
 * HU-13 «Monto inválido», from the API's side: it answers every movement rule
 * with the same `movements.invalid` and names the rule in the message. The
 * amount is the one the form can point at, so it must survive the mapping.
 */

import { AxiosError, AxiosHeaders } from 'axios';

import { InvalidMovementError } from '../../../domain';
import { mapApiError } from '../mapApiError';

function apiError(code: string, message: string): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config,
    data: { code, message },
  });
}

describe('HU-13 · the API refusing a movement', () => {
  it.each([['Amount must be greater than zero'], ['Amount is out of range']])(
    'names the amount when the API says «%s»',
    (message) => {
      const error = mapApiError(apiError('movements.invalid', message));

      expect(error).toBeInstanceOf(InvalidMovementError);
      expect((error as InvalidMovementError).field).toBe('amount');
    },
  );

  it('names no field for another movement rule', () => {
    const error = mapApiError(
      apiError('movements.invalid', 'A transfer needs two different sources'),
    );

    expect(error).toBeInstanceOf(InvalidMovementError);
    expect((error as InvalidMovementError).field).toBeNull();
  });
});
