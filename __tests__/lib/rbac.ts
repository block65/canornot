import type { JSONSchema7 } from 'json-schema';
import { CanOrNot } from '../../lib/index.js';

const policySchema: JSONSchema7 = {
  type: 'object',
  additionalProperties: false,
  properties: {
    role: {
      $ref: 'actor#/properties/roles',
    },
  },
};

async function getActorSchema(): Promise<JSONSchema7> {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      roles: {
        type: 'string',
        enum: ['admin', 'user'],
      },
    },
  };
}

export function rbac(): CanOrNot {
  return new CanOrNot({
    actorSchema: getActorSchema(),
    policySchema,
  });
}
