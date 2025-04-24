export class ConfigurationError extends Error {
  constructor(message: string) {
    super(`Failed to gather configuration. ${message}`);
  }
}

export class MissingEnvironmentVariableError extends ConfigurationError {
  constructor(public readonly variableName: string) {
    super(`Missing environment variable: ${variableName}`);
  }
}

export class InvalidEnumError extends ConfigurationError {
  constructor(
    public readonly variableName: string,
    public readonly allowedValues: string[],
    public readonly value: string,
  ) {
    super(
      `Environment variable ${variableName}=${value} is not one of the allowed values: ${allowedValues.join(', ')}`,
    );
  }
}

export class InvalidIntegerError extends ConfigurationError {
  constructor(
    public readonly variableName: string,
    public readonly value: string,
  ) {
    super(
      `Environment variable ${variableName} is not a valid integer: ${value}`,
    );
  }
}
