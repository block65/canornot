import * as Ajv from 'ajv';
// eslint-disable-next-line import/no-extraneous-dependencies
import { JSONSchema7 } from 'json-schema';
import debug from 'debug';
import { PermissionError } from './permission-error';

type SchemaFunction = () => JSONSchema7 | Promise<JSONSchema7>;

interface CanOrNotOptions {
  logger?: (msg: string, ...args: any[]) => any;
  rejectOnError?: boolean;
  rejectOnPermissionDenied?: boolean;
  returnSchemas?: boolean;
  policySchema: SchemaFunction | JSONSchema7 | Promise<JSONSchema7>;
  actorSchema: SchemaFunction | JSONSchema7 | Promise<JSONSchema7>;
}

export class Canornot {
  private options: Required<CanOrNotOptions>;

  constructor(opts: CanOrNotOptions) {
    this.options = {
      rejectOnError: true,
      rejectOnPermissionDenied: true,
      returnSchemas: false,
      logger: debug('canornot'),
      ...opts,
    };
  }

  protected log(msg: string, ...args: any[]): void {
    this.options.logger(msg, ...args);
  }

  public async can(
    permission: string,
    data: unknown = {},
  ): Promise<boolean | { actor: JSONSchema7; policy: JSONSchema7 }> {
    if (typeof permission !== 'string') {
      throw new TypeError(
        `Permission arg must be a string. ${typeof permission}`,
      );
    }

    try {
      const schemas = await Promise.all([
        this.getActorSchema(),
        this.getPolicySchema(),
      ]);

      const [actorSchema, policySchema] = schemas;

      if (typeof actorSchema !== 'object') {
        this.log('Invalid actor schema');
        throw new TypeError(
          `Actor Schema must be an object or a function/promise that returns an object. Saw ${typeof actorSchema}`,
        );
      }

      if (typeof policySchema !== 'object') {
        this.log('Invalid policy schema');
        throw new TypeError(
          `Policy Schema must be an object or a function/promise that returns an object. Saw ${typeof policySchema}`,
        );
      }

      policySchema.additionalProperties = false;

      const ajv = new Ajv({
        missingRefs: 'fail',
      });

      ajv.addSchema(actorSchema, 'actor');

      const valid = ajv.validate(policySchema, {
        [permission]: data,
      });

      this.log('policySchema: %o', policySchema);
      this.log('actorSchema: %o', actorSchema);
      this.log('Permission data: %o', {
        [permission]: data,
      });

      this.log('Permission allowed/valid?', valid);

      if (this.options.rejectOnPermissionDenied === true) {
        if (!valid) {
          this.log('Throwing PermissionError', ajv.errors);
          const err = new PermissionError(
            `Permission Denied for \`${permission}\``,
          );
          err.errors = ajv.errors;
          err.data = data;
          throw err;
        }
        if (this.options.returnSchemas) {
          return {
            actor: actorSchema,
            policy: policySchema,
          };
        }
        return valid;
      }
      this.log('Returning `%s` result: %s', permission, valid);
      return valid;
    } catch (err) {
      this.log('Error fetching actor or policy schema', err.message);

      // it's not a basic permission error;
      if (
        err instanceof PermissionError &&
        this.options.rejectOnPermissionDenied === true
      ) {
        throw err;
      } else if (this.options.rejectOnError === true) {
        throw err;
      } else {
        return false;
      }
    }
  }

  private async getActorSchema(): Promise<JSONSchema7> {
    if (typeof this.options.actorSchema === 'function') {
      return this.options.actorSchema();
    }
    return Promise.resolve(this.options.actorSchema);
  }

  private async getPolicySchema(): Promise<JSONSchema7> {
    if (typeof this.options.policySchema === 'function') {
      return this.options.policySchema();
    }
    return this.options.policySchema;
  }
}

export default Canornot;
