import type { ErrorObject } from 'ajv';
import { CustomError, Status } from '@block65/custom-error';

export class PermissionError extends CustomError {
  public errors: ErrorObject[] | null | undefined;

  public data: unknown;

  constructor(message: string) {
    super(message);
    this.setName('PermissionError');
    this.statusCode = Status.INVALID_ARGUMENT;
    this.sensitive = true;
  }
}
