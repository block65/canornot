import { describe, test } from '@jest/globals';
import { abac } from './lib/abac.js';

describe('ABAC', (): void => {
  const ac = abac();

  test('Permission attributes with no more info', async (): Promise<void> => {
    const allowed = await ac.can('project:list');

    if (allowed !== true) {
      throw new Error('Permission denied');
    }
  });

  test('Permission attributes as integer', async (): Promise<void> => {
    const allowed = await ac.can('project:get', 3);

    if (allowed !== true) {
      throw new Error('Permission denied');
    }
  });

  test('Permission attributes as integer (REJECTED)', async (): Promise<void> => {
    const allowed = await ac.can('project:get', 99999);

    if (allowed === true) {
      throw new Error('This test should disallow permission');
    }
  });

  test('Permission user:get attributes as undefined (REJECTED)', async (): Promise<void> => {
    const allowed = await ac.can('user:get');

    if (allowed === true) {
      throw new Error('This test should disallow permission');
    }
  });

  test('Permission attributes as object', async (): Promise<void> => {
    const allowed = await ac.can('account:get', { accountId: 22 });

    if (allowed !== true) {
      throw new Error('Permission denied');
    }
  });

  test('Permission attributes as object (REJECTED)', async (): Promise<void> => {
    const allowed = await ac.can('account:get', { accountId: 999999 });

    if (allowed === true) {
      throw new Error('This test should disallow permission');
    }
  });

  test('Permission attributes as object w/undefiend values (REJECTED)', async (): Promise<void> => {
    const allowed = await ac.can('account:get', { accountId: undefined });

    if (allowed === true) {
      throw new Error('This test should disallow permission');
    }
  });
});
