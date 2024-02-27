export class ConfigurationError extends Error {
  constructor(message: string) {
    super(`Failed to gather configuration. ${message}`);
  }
}

export class MissingEnvironmentVariableError extends ConfigurationError {
  variableName: string;

  constructor(variableName: string) {
    super(`Missing environment variable: ${variableName}`);
    this.variableName = variableName;
  }
}

export class InvalidEnumError extends ConfigurationError {
  variableName: string;
  allowedValues: string[];
  value: string;

  constructor(variableName: string, allowedValues: string[], value: string) {
    super(
      `Environment variable ${variableName}=${value} is not one of the allowed values: ${allowedValues.join(', ')}`
    );
    this.variableName = variableName;
    this.allowedValues = allowedValues;
    this.value = value;
  }
}

export class InvalidIntegerError extends ConfigurationError {
  variableName: string;
  value: string;

  constructor(variableName: string, value: string) {
    super(`Environment variable ${variableName} is not a valid integer: ${value}`);
    this.variableName = variableName;
    this.value = value;
  }
}
