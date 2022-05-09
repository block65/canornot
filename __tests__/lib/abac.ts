import type { JSONSchema7 } from 'json-schema';
import { CanOrNot } from '../../lib/index.js';

const policySchema: JSONSchema7 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    'user:get': {
      $ref: 'actor#/properties/userId',
    },
    'project:get': {
      $ref: 'actor#/properties/projectIds',
    },
    'account:get': {
      required: ['accountId'],
      type: 'object',
      properties: {
        accountId: {
          $ref: 'actor#/properties/accountIds',
        },
      },
    },
    'account:list': {
      $ref: 'actor#/properties/accountIds',
    },
    'project:list': {},
  },
  patternProperties: {
    '^payment:w+$': {
      $ref: 'actor#/properties/accountIds',
    },
  },
};

function getActorSchema(): JSONSchema7 {
  return {
    $id: 'actor',
    description: 'Actor Properties',
    type: 'object',
    additionalProperties: false,
    properties: {
      userId: {
        type: 'number',
        enum: [2222],
      },
      projectIds: {
        type: 'number',
        enum: [1, 2, 3, 4, 5],
      },
      accountIds: {
        type: 'number',
        enum: [11, 22, 33, 44],
      },
      role: {
        type: 'string',
        enum: ['user', 'admin'],
      },
    },
  };
}

export const abac = (): CanOrNot =>
  new CanOrNot({
    rejectOnPermissionDenied: false,
    actorSchema: getActorSchema(),
    policySchema,
  });
