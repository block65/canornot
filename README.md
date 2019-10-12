# Canornot

[![npm version](https://badge.fury.io/js/canornot.svg)](https://badge.fury.io/js/canornot) [![Build Status](https://travis-ci.org/nulllines/canornot.svg?branch=master)](https://travis-ci.org/maxholman/canornot) [![Coverage Status](https://coveralls.io/repos/github/nulllines/canornot/badge.svg?branch=master)](https://coveralls.io/github/nulllines/canornot?branch=master)

An authorisation and access control library based on JSON Schema.

### Install

Using NPM

```bash
npm install canornot --save
```

Using Yarn

```bash
yarn add canornot
```

### Usage

Example ABAC module based on Canornot

It exports a function which takes a JWT, verifies it and then returns a Canornot instance
for that JWT

```javascript
// abac.js

import * as jsonwebtoken from 'jsonwebtoken';
import { Canornot } from '@colacube/canornot';
import { datastore } from 'some-kind-of-datastore';

// A policy that allows getting your own user details, and editing companies
// in your list of company ids
const userPolicySchema = {
  properties: {
    'user:get': {
      $ref: 'actor#/properties/userId',
    },
    'company:edit': {
      $ref: 'actor#/properties/companyIds',
    },
  },
};

async function getActorSchema({ userId }) {
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
        enum: companyIds,
      },
    },
  };
}

export const createAbac = (jwt) => {

  // Verify the JWT with our super secure secret
  const decoded = jsonwebtoken.verify(jwt, 'canornot');

  // Return a Canornot instance with our user policy schema
  // and an actor schema based on the decoded JWT details 
  return new Canornot({
    actorSchema: getActorSchema(decoded),
    policySchema: userPolicySchema,
  });
};
```

Example use of the above ABAC module

```javascript

//This is our ABAC module based on Canornot
import { createAbac } from './abac.js';

// JWT may come from a HTTP header or similar - it is signed, and contains {userId: 12344}
const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcklkIjoxMjM0NCwiaWF0IjoxNTE2MjM5MDIyfQ.oJh686kpqqfvYbY8GjZn34iUpFQzNQTIRNBjfe90nGM';

// Create an ABAC instance using the JWT
const userPermissions = createAbac(jwt);

// Permission is allowed
userPermissions
  .can('user:get', 12344)
  .then(() => console.log('Permission allowed!'))
  .catch(() => console.warn('Permission denied!'));

// Permission is denied!
userPermissions
  .can('user:get', 99999)
  .then(() => console.log('Permission allowed!'))
  .catch(() => console.warn('Permission denied!'));
```

### License

MIT (See LICENCE file)
