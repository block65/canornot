import { CustomError } from 'ts-custom-error';
import * as Ajv from 'ajv';

export class PermissionError extends CustomError {
  public statusCode: number;

  public internal: boolean;

  public errors: Ajv.ErrorObject[] | null | undefined;

  public data: unknown;

  constructor(message: string) {
    super(message);
    this.statusCode = 403;
    this.internal = true;
  }
}
