import { JSONSchema7 } from 'json-schema';
import Canornot from '../../lib';

const policySchema: JSONSchema7 = {
  properties: {
    role: {
      $ref: 'actor#/properties/roles',
    },
  },
};

async function getActorSchema(): Promise<JSONSchema7> {
  return {
    properties: {
      roles: {
        type: 'string',
        enum: ['admin', 'user'],
      },
    },
  };
}

export const rbac = (/* options */): Canornot =>
  new Canornot({
    actorSchema: getActorSchema(),
    policySchema,
  });
