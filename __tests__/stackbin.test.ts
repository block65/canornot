import { stackbin } from './lib/stackbin';
import { PermissionError } from '../lib/permission-error';

describe('Stackbin', () => {
  const ac = stackbin();

  test('Basic User check', () =>
    ac.can('user:get', { userId: '00000098038114680832' }));

  test('Basic User check REJECT', (): Promise<void> =>
    ac
      .can('user:get', {
        userId: '00030164495926034432',
      })
      .then((): void => {
        throw new Error('This test should disallow permission');
      })
      .catch((err): void => expect(err).toBeInstanceOf(PermissionError)));
});
