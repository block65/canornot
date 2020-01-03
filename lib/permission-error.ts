import { CustomError } from '@colacube/custom-error';
import * as Ajv from 'ajv';

export class PermissionError extends CustomError {

  public errors: Ajv.ErrorObject[] | null | undefined;

  public data: unknown;

  constructor(message: string) {
    super(message);
    this.setName('PermissionError');
    this.statusCode = 403;
    this.internal = true;
  }
}
