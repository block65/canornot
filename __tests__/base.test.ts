import { describe, test, expect } from '@jest/globals';
import type { JSONSchema7 } from 'json-schema';
import { CanOrNot } from '../lib/index.js';
import { PermissionError } from '../lib/permission-error.js';

class TestError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, TestError.prototype);
  }
}

const policySchema: JSONSchema7 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    'user:get': {
      $ref: 'actor#/properties/userId',
    },
  },
};

const actorSchema: JSONSchema7 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    userId: {
      type: 'number',
      enum: [1],
    },
  },
};

const promiseWait = (
  value: JSONSchema7 | Error,
  ms: number,
): Promise<JSONSchema7> =>
  new Promise((resolve, reject): void => {
    setTimeout((): void => {
      if (value instanceof Error) {
        reject(value);
      } else {
        resolve(value);
      }
    }, ms);
  });

const acWithTimeoutCallbacks = (): CanOrNot =>
  new CanOrNot({
    actorSchema: (): Promise<JSONSchema7> => promiseWait(actorSchema, 200),
    policySchema: (): Promise<JSONSchema7> => promiseWait(policySchema, 200),
  });

const acWithTimeoutCallbackActorError = (): CanOrNot =>
  new CanOrNot({
    actorSchema: (): Promise<JSONSchema7> =>
      promiseWait(new TestError('Intentional Error'), 200),
    policySchema: (): Promise<JSONSchema7> => promiseWait(policySchema, 200),
  });

const acWithTimeoutCallbackPolicyError = (): CanOrNot =>
  new CanOrNot({
    actorSchema: (): Promise<JSONSchema7> =>
      promiseWait(new TestError('Intentional Error'), 200),
    policySchema: (): Promise<JSONSchema7> =>
      promiseWait(new TestError('Intentional Error'), 200),
  });

const acWithSyncSchemaErrors = (): CanOrNot =>
  new CanOrNot({
    actorSchema: (): Promise<JSONSchema7> => {
      throw new TestError('Intentional Error');
    },
    policySchema: (): Promise<JSONSchema7> => {
      throw new TestError('Intentional Error');
    },
  });

const acWithTimeoutPromises = (): CanOrNot =>
  new CanOrNot({
    actorSchema: (): Promise<JSONSchema7> => promiseWait(actorSchema, 200),
    policySchema: (): Promise<JSONSchema7> => promiseWait(policySchema, 200),
  });

const acWithTimeoutBrokenPromises = (): CanOrNot =>
  new CanOrNot({
    actorSchema: new Promise((_, reject) =>
      setTimeout(() => reject(new TestError('Intentional Error')), 200),
    ),
    policySchema: new Promise((_, reject) =>
      setTimeout(() => reject(new TestError('Intentional Error')), 200),
    ),
  });

const acWithObjects = (): CanOrNot =>
  new CanOrNot({
    actorSchema,
    policySchema,
  });

const acWithFunctions = (): CanOrNot =>
  new CanOrNot({
    actorSchema: (): JSONSchema7 => actorSchema,
    policySchema: (): JSONSchema7 => policySchema,
  });

const acWithStrings1 = (): CanOrNot =>
  new CanOrNot({
    actorSchema: 'hahaha' as any, //
    policySchema,
  });

const acWithStrings2 = (): CanOrNot =>
  new CanOrNot({
    actorSchema,
    policySchema: 'heeee' as any,
  });

// @ts-ignore
const acWithNoOptions = (): CanOrNot => new CanOrNot();

const acWithRejectOnPermissionDenied = (): CanOrNot =>
  new CanOrNot({
    actorSchema,
    policySchema,
    rejectOnPermissionDenied: true,
  });

const acWithoutRejectOnPermissionDenied = (): CanOrNot =>
  new CanOrNot({
    actorSchema,
    policySchema,
    rejectOnPermissionDenied: false,
  });

const acWithoutRejectOnError = (): CanOrNot =>
  new CanOrNot({
    actorSchema: Promise.reject(new TestError('test')),
    policySchema: Promise.reject(new TestError('test')),
    rejectOnError: false,
  });

const acWithRejectOnError = (): CanOrNot =>
  new CanOrNot({
    actorSchema: Promise.reject(new TestError('test')),
    policySchema: Promise.reject(new TestError('test')),
  });

describe('Base', () => {
  test('Access Control with schema provided via callback', () => {
    const permission = acWithTimeoutCallbacks();

    return permission.can('user:get', 1).then((allowed) => {
      if (allowed !== true) {
        throw new Error('Unexpectedly forbidden');
      }
    });
  });

  test('Access Control with schema provided via Promises', () => {
    const permission = acWithTimeoutPromises();

    return permission.can('user:get', 1).then((allowed) => {
      if (allowed !== true) {
        throw new Error('Unexpectedly forbidden');
      }
    });
  });

  test('Access Control with schema provided via objects', () => {
    const permission = acWithObjects();

    return permission.can('user:get', 1).then((allowed) => {
      if (allowed !== true) {
        throw new Error('Unexpectedly forbidden');
      }
    });
  });

  test('Access Control with schema provided via functions', () => {
    const permission = acWithFunctions();

    return permission.can('user:get', 1).then((allowed) => {
      if (allowed !== true) {
        throw new Error('Unexpectedly forbidden');
      }
    });
  });

  test('Access Control with broken promises', () => {
    const permission = acWithTimeoutBrokenPromises();

    return permission
      .can('user:get', 1)
      .then(() => {
        throw new Error('This test should throw an error');
      })
      .catch((err) => {
        expect(err).toBeInstanceOf(TestError);
      });
  });

  test('Access Control with callback actor errors', () => {
    const permission = acWithTimeoutCallbackActorError();

    return permission
      .can('user:get', 1)
      .then(() => {
        throw new Error('This test should throw an error');
      })
      .catch((err): void => expect(err).toBeInstanceOf(TestError));
  });

  test('Access Control with callback policy errors', () => {
    const permission = acWithTimeoutCallbackPolicyError();

    return permission
      .can('user:get', 1)
      .then(() => {
        throw new Error('This test should throw an error');
      })
      .catch((err): void => expect(err).toBeInstanceOf(TestError));
  });

  test('Access Control with callback policy errors', () => {
    const permission = acWithTimeoutCallbackPolicyError();

    return permission
      .can('user:get', 1)
      .then(() => {
        throw new Error('This test should throw an error');
      })
      .catch((err): void => expect(err).toBeInstanceOf(TestError));
  });

  test('Access Control with policy PermissionError0', () => {
    const permission = acWithObjects();

    return permission
      .can(1111111 as any)
      .then(() => {
        throw new Error('This test should throw an error');
      })
      .catch((err: Error): void => {
        expect(err).toBeInstanceOf(PermissionError);
      });
  });

  test('Access Control with policy TypeErrors1', () => {
    const permission = acWithStrings1();

    return permission
      .can('user:get', 1)
      .then(() => {
        throw new Error('This test should throw an error');
      })
      .catch((err): void => expect(err).toBeInstanceOf(TypeError));
  });

  test('Access Control with policy TypeErrors2', () => {
    const permission = acWithStrings2();

    return permission
      .can('user:get', 1)
      .then(() => {
        throw new Error('This test should throw an error');
      })
      .catch((err) => {
        expect(err).toBeInstanceOf(TypeError);
      });
  });

  test('Access Control with no options', () => {
    const permission = acWithNoOptions();

    return permission
      .can('user:get', 1)
      .then(() => {
        throw new Error('This test should throw an error');
      })
      .catch((err) => {
        expect(err).toBeInstanceOf(TypeError);
      });
  });

  test('Access Control with reject (expected fail)', () => {
    const permission = acWithRejectOnPermissionDenied();

    return permission
      .can('user:get', 99999999999)
      .then(() => {
        throw new Error('This test should throw an error');
      })
      .catch((err): void => expect(err).toBeInstanceOf(PermissionError));
  });

  test('Access Control with reject (expected success)', () => {
    const permission = acWithRejectOnPermissionDenied();

    return permission.can('user:get', 1);
  });

  test('Access Control without reject', () => {
    const permission = acWithoutRejectOnPermissionDenied();

    return permission.can('user:get', 999999999).then((valid): void => {
      expect(valid).toBeFalsy();
    });
  });

  test('Access Control missing permission', () => {
    const permission = acWithObjects();

    return permission
      .can('missing:permission', 999999999)
      .then((): void => {
        throw new Error('This test should throw an error');
      })
      .catch((err): void => expect(err).toBeInstanceOf(PermissionError));
  });

  test('Access Control without reject on validator error', async () => {
    const permission = acWithoutRejectOnError();

    return permission
      .can('missing:permission', 999999999)
      .then((valid): void => {
        expect(valid).toBeFalsy();
      });
  });

  test('Access Control with reject on validator error', () => {
    const permission = acWithRejectOnError();

    return permission
      .can('missing:permission', 999999999)
      .then((xxx): void => {
        throw new Error('This test should throw an error');
      })
      .catch((err): void => {
        expect(err).toBeInstanceOf(TestError);
      });
  });

  test('Access Control with immediate sync errors in schema', async () => {
    const permission = acWithSyncSchemaErrors();

    await expect(permission.can('user:get', 1)).rejects.toBeInstanceOf(
      TestError,
    );
  });

  // test('Access Control using patternProperties to allow an entire namespace', function () {
  //
  //     const permission = acWithObjects();
  //
  //     return permission.can('payment:something', 33)
  //         .then(function (valid) {
  //             assert.isNotOk(valid);
  //             done();
  //         })
  //         .catch(done);
  // });
});
