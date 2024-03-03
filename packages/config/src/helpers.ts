import {
  InvalidEnumError,
  InvalidIntegerError,
  MissingEnvironmentVariableError,
} from './errors';

/**
 * Get a string environment variable.
 *
 * If the variable is not defined, it throws an error.
 *
 * @param variableName
 * @returns value
 */
export const string = (variableName: string): string => {
  const value = process.env[variableName];

  if (!value) {
    throw new MissingEnvironmentVariableError(variableName);
  }

  return value;
};

/**
 * Get a string environment variable.
 *
 * If the variable is not defined or is not one of the allowed values, it throws an error.
 *
 * @param variableName
 * @returns value
 */
export const oneOf = <T extends string>(
  variableName: string,
  allowedValues: T[],
): T => {
  const value = string(variableName) as T;

  if (!allowedValues.includes(value)) {
    throw new InvalidEnumError(variableName, allowedValues, value);
  }

  return value;
};

/**
 * Get an integer environment variable.
 *
 * If the variable is not defined or is not an integer, it throws an error.
 *
 * @param variableName
 * @returns value
 */
export const integer = (variableName: string): number => {
  const value = string(variableName);

  const parsedValue = parseInt(value);

  if (isNaN(parsedValue) || parsedValue.toString() !== value) {
    throw new InvalidIntegerError(variableName, value);
  }

  return parsedValue;
};

/**
 * Get a boolean environment variable.
 *
 * If the variable is not defined or is not a boolean, it throws an error.
 *
 * @param variableName
 * @returns value
 */
export const boolean = (variableName: string): boolean => {
  const value = oneOf(variableName, ['true', 'false']);

  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      assertNever(value);
  }
};

function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
