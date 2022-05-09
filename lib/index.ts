import Ajv from 'ajv';
import type { JSONSchema7 } from 'json-schema';
import { PermissionError } from './permission-error.js';

type SchemaFunction = () => JSONSchema7 | Promise<JSONSchema7>;

interface CanOrNotOptions {
  logger?: (data?: Record<string, unknown>, msg?: string) => any;
  rejectOnError?: boolean;
  rejectOnPermissionDenied?: boolean;
  returnSchemas?: boolean;
  policySchema: SchemaFunction | JSONSchema7 | Promise<JSONSchema7>;
  actorSchema: SchemaFunction | JSONSchema7 | Promise<JSONSchema7>;
}

export class CanOrNot {
  private options: CanOrNotOptions;

  constructor(opts: CanOrNotOptions) {
    this.options = {
      rejectOnError: true,
      rejectOnPermissionDenied: true,
      returnSchemas: false,
      ...opts,
    };
  }

  public async can(
    permission: string,
    data: unknown = {},
  ): Promise<{ actor: JSONSchema7; policy: JSONSchema7 } | boolean> {
    try {
      const schemas = await Promise.all([
        this.getActorSchema(),
        this.getPolicySchema(),
      ]).catch((err) => {
        this.log(
          { err },
          `Error fetching actor or policy schemas: ${err.message}`,
        );
        throw err;
      });

      const [actorSchema, policySchema] = schemas || [];

      if (typeof actorSchema !== 'object') {
        this.log({ actorSchema }, 'Invalid actor schema');
        throw new TypeError(
          `Actor Schema must be an object or a function/promise that returns an object. Saw ${typeof actorSchema}`,
        );
      }

      if (typeof policySchema !== 'object') {
        this.log({ policySchema }, 'Invalid policy schema');
        throw new TypeError(
          `Policy Schema must be an object or a function/promise that returns an object. Saw ${typeof policySchema}`,
        );
      }

      // force additionalProperties false if not provided
      if (
        policySchema.properties &&
        !('additionalProperties' in policySchema)
      ) {
        policySchema.additionalProperties = false;
      }

      const ajv = new Ajv({
        strict: true,
        allErrors: true,
        verbose: !!this.options.logger,
      });

      ajv.addSchema(actorSchema, 'actor');

      const valid = ajv.validate(policySchema, {
        [permission]: data,
      });

      this.log(
        {
          policySchema,
          actorSchema,
          permissionData: {
            [permission]: data,
          },
        },
        'Schemas',
      );

      this.log({ valid }, 'Permission decision');

      if (this.options.rejectOnPermissionDenied) {
        if (!valid) {
          this.log({ errors: ajv.errors }, 'Throwing PermissionError');
          const err = new PermissionError(
            `Permission Denied for \`${permission}\``,
          );
          err.errors = ajv.errors;
          err.data = data;
          throw err;
        }

        if (this.options.returnSchemas === true) {
          return {
            actor: actorSchema,
            policy: policySchema,
          };
        }

        return valid;
      }

      this.log({ permission, valid }, 'Returning result');
      return valid;
    } catch (err) {
      // it's not a basic permission error
      if (
        err instanceof PermissionError &&
        this.options.rejectOnPermissionDenied
      ) {
        throw err;
      } else if (this.options.rejectOnError) {
        throw err;
      } else {
        return false;
      }
    }
  }

  protected log(data?: Record<string, unknown>, msg?: string): void {
    if (this.options.logger) {
      this.options.logger(data, msg);
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
    return Promise.resolve(this.options.policySchema);
  }
}
