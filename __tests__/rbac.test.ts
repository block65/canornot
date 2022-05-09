import { describe, test } from '@jest/globals';
import { rbac } from './lib/rbac.js';

describe('RBAC', (): void => {
  const ac = rbac();

  test('Basic role check', async (): Promise<void> => {
    const allowed = await ac.can('role', 'admin');

    if (allowed !== true) {
      throw new Error('Permission denied');
    }
  });
});
