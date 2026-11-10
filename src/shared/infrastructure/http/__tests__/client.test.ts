/**
 * HU-02 «Petición sin token vigente», on the client's side: a request the API
 * answers with 401 tries to refresh the session ONCE. With a new token it is
 * sent again; when the refresh fails too, the session is over — the tokens are
 * dropped and the app is told (`onSessionExpired`), which sends it to login.
 */

import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

import { SecureStorage } from '../../storage/SecureStorage';
import { createHttpClient, setOnSessionExpired } from '../client';

jest.mock('../../config/env', () => ({
  env: { apiUrl: 'http://api.test', environment: 'development' },
}));

const mockStore: Record<string, string> = {};
jest.mock('../../storage/SecureStorage', () => ({
  SecureStorageKeys: {
    accessToken: 'deshka.accessToken',
    refreshToken: 'deshka.refreshToken',
  },
  SecureStorage: {
    get: jest.fn(async (key: string) => mockStore[key] ?? null),
    set: jest.fn(async (key: string, value: string) => {
      mockStore[key] = value;
    }),
    remove: jest.fn(async (key: string) => {
      delete mockStore[key];
    }),
  },
}));

type Answer = { status: number; data?: unknown };

/** Stands in for the network: answers each request with the next status. */
function fakeApi(answers: Answer[]) {
  const seen: InternalAxiosRequestConfig[] = [];
  const adapter = jest.fn(async (config: InternalAxiosRequestConfig) => {
    seen.push(config);
    const answer = answers.shift() ?? { status: 200 };
    const response = {
      status: answer.status,
      statusText: String(answer.status),
      headers: new AxiosHeaders(),
      config,
      data: answer.data ?? {},
    };
    if (answer.status >= 400) {
      throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, response);
    }
    return response;
  });
  return { adapter, seen };
}

const refresh = jest.spyOn(axios, 'post');
const expired = jest.fn();

beforeEach(() => {
  for (const key of Object.keys(mockStore)) delete mockStore[key];
  mockStore['deshka.accessToken'] = 'old-access';
  mockStore['deshka.refreshToken'] = 'refresh-1';
  refresh.mockReset();
  expired.mockReset();
  setOnSessionExpired(expired);
});

function clientWith(answers: Answer[]) {
  const api = fakeApi(answers);
  const client = createHttpClient('http://api.test');
  client.defaults.adapter = api.adapter;
  return { client, ...api };
}

describe('HU-02 · Petición sin token vigente', () => {
  it('refreshes once and, if that fails too, ends the session', async () => {
    refresh.mockRejectedValue(new Error('refresh token expired'));
    const { client, adapter } = clientWith([{ status: 401 }]);

    await expect(client.get('/movements')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith(
      'http://api.test/auth/refresh',
      { refresh_token: 'refresh-1' },
      expect.anything(),
    );
    // The original request is not retried without a token to retry it with.
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(expired).toHaveBeenCalledTimes(1);
    expect(SecureStorage.remove).toHaveBeenCalledWith('deshka.accessToken');
    expect(SecureStorage.remove).toHaveBeenCalledWith('deshka.refreshToken');
    expect(mockStore).toEqual({});
  });

  it('sends the request again with the new token when the refresh works', async () => {
    refresh.mockResolvedValue({
      data: { access_token: 'new-access', refresh_token: 'refresh-2' },
    });
    const { client, seen } = clientWith([{ status: 401 }, { status: 200, data: [] }]);

    const response = await client.get('/movements');

    expect(response.status).toBe(200);
    expect(seen).toHaveLength(2);
    expect(seen[1]!.headers.Authorization).toBe('Bearer new-access');
    expect(mockStore['deshka.refreshToken']).toBe('refresh-2');
    expect(expired).not.toHaveBeenCalled();
  });

  it('does not refresh in a loop when the retried request is refused again', async () => {
    refresh.mockResolvedValue({
      data: { access_token: 'new-access', refresh_token: 'refresh-2' },
    });
    const { client, adapter } = clientWith([{ status: 401 }, { status: 401 }]);

    await expect(client.get('/movements')).rejects.toBeTruthy();

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('never refreshes on a failed login: a wrong password is not an expired session', async () => {
    const { client } = clientWith([{ status: 401 }]);

    await expect(client.post('/auth/login', {})).rejects.toBeTruthy();

    expect(refresh).not.toHaveBeenCalled();
    expect(expired).not.toHaveBeenCalled();
  });
});
