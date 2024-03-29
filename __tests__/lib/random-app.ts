import type { JSONSchema7 } from 'json-schema';
import { CanOrNot } from '../../lib/index.js';

const policySchema: JSONSchema7 = {
  $id: 'policy',
  description: 'Generic User Policy',
  definitions: {
    accountId: {
      type: 'object',
      additionalProperties: false,
      required: ['accountId'],
      properties: {
        accountId: {
          $ref: 'actor#/properties/accountId',
        },
      },
    },
    projectId: {
      type: 'object',
      required: ['projectId'],
      additionalProperties: false,
      properties: {
        projectId: {
          $ref: 'actor#/properties/projectId',
        },
      },
    },
    userId: {
      type: 'object',
      required: ['userId'],
      additionalProperties: false,
      properties: {
        userId: {
          $ref: 'actor#/properties/userId',
        },
      },
    },
  },
  additionalProperties: false,
  type: 'object',
  properties: {
    /**
     * USERS
     */
    'user:get': {
      $ref: '#/definitions/userId',
    },
    'user:update': {
      $ref: '#/definitions/userId',
    },
  },
};

const actorSchema: JSONSchema7 = {
  $id: 'actor',
  description: 'User Actor',
  type: 'object',
  additionalProperties: false,
  properties: {
    userId: {
      enum: ['00000098038114680832'],
    },
  },
};

export function randomApp(): CanOrNot {
  return new CanOrNot({
    rejectOnError: true,
    rejectOnPermissionDenied: true,
    returnSchemas: true,
    actorSchema,
    policySchema,
  });
}
