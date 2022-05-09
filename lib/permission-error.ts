import type { ErrorObject } from 'ajv';
import { CustomError, Status } from '@block65/custom-error';

export class PermissionError extends CustomError {
  public errors: ErrorObject[] | null | undefined;

  public data: unknown;

  public code = Status.PERMISSION_DENIED;
}
