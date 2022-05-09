# canornot

An authorisation and access control library based on JSON Schema.

### Install

```bash
yarn add @block65/canornot
```

### Usage

Example ABAC module based on canornot

#### abac.ts

Exports a function which takes a JWT, verifies it and then returns a `CanOrNot`
instance for the relevant user.

```typescript
import type { JSONSchema7 } from 'json-schema';
import jsonwebtoken from 'jsonwebtoken';
import { CanOrNot } from '@block65/canornot';
import { datastore } from './lib/some-kind-of-datastore.js';

// A policy that allows getting your own user details, and editing companies
// in your list of company ids
const policySchema: JSONSchema7 = {
  properties: {
    'user:get': {
      $ref: 'actor#/properties/userId',
    },
    'company:edit': {
      $ref: 'actor#/properties/companyIds',
    },
  },
};

// Gets the actor schema with a little help from the datastore
async function getActorSchema(userId: string): Promise<JSONSchema7> {
  const { userId, companyIds } = await datastore.fetchUserById(userId);

  return {
    $id: 'actor',
    description: 'Actor Properties',
    type: 'object',
    additionalProperties: false,
    properties: {
      userId: {
        type: 'number',
        const: userId,
      },
      companyIds: {
        type: 'number',
        enum: [null, ...companyIds],
      },
    },
  };
}

export function createAbac(jwt: string): CanOrNot {
  // Returns a CanOrNot instance with our user policy schema
  // and an actor schema based on the decoded JWT details
  // NOTE: These methods can (and should) be memoized to reduce latency
  return new CanOrNot({
    policySchema,
    actorSchema() {
      const decoded = jsonwebtoken.verify(jwt, 'secret123');
      return getActorSchema(decoded.userId);
    },
  });
}
```

#### index.ts

Example use of the above ABAC module `abac.ts`

```typescript
// This is our ABAC module based on Canornot
import { createAbac } from './abac.js';

// JWT may come from a HTTP header or similar
const jwt = 'eyJhbGciOiJIUz...NBjfe90nGM';

// Create an ABAC instance using the JWT
const abac = createAbac(jwt);

// Permission is allowed
abac
  .can('user:get', 12344)
  .then(() => console.log('Permission allowed!'))
  .catch(() => console.warn('Permission denied!'));

// Permission is denied!
abac
  .can('user:get', 99999)
  .then(() => console.log('Permission allowed!'))
  .catch(() => console.warn('Permission denied!'));
```
