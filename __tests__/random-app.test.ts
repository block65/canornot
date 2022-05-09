import { describe, expect, test } from '@jest/globals';
import { PermissionError } from '../lib/permission-error.js';
import { randomApp } from './lib/random-app.js';

describe('Random App', () => {
  const ac = randomApp();

  test('Basic User check', () =>
    ac.can('user:get', { userId: '00000098038114680832' }));

  test('Basic User check REJECT', (): Promise<void> =>
    ac
      .can('user:get', {
        userId: '00030164495926034432',
      })
      .then(() => {
        throw new Error('This test should disallow permission');
      })
      .catch((err) => expect(err).toBeInstanceOf(PermissionError)));
});
