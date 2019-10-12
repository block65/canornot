import { rbac } from './lib/rbac';

describe('RBAC', (): void => {
  const ac = rbac();

  test('Basic role check', async (): Promise<void> => {
    const allowed = await ac.can('role', 'admin');

    if (allowed !== true) {
      throw new Error('Permission denied');
    }
  });
});
