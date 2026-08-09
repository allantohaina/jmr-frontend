// Validation utilities for both client & server side
// Never trust user input - validate everything!

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
}

// Email validator
export function validateEmail(email: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
    return errors;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }
  
  return errors;
}

// Name validator
export function validateName(name: string, min = 2, max = 100): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
    return errors;
  }
  
  if (name.length < min) {
    errors.push({ field: 'name', message: `Name must be at least ${min} characters` });
  }
  
  if (name.length > max) {
    errors.push({ field: 'name', message: `Name must be less than ${max} characters` });
  }
  
  return errors;
}

// Password validator
export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!password || password.trim() === '') {
    errors.push({ field: 'password', message: 'Password is required' });
    return errors;
  }
  
  if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' });
  }
  
  return errors;
}

// Quote request validator
export function validateQuoteRequest(data: {
  name: string;
  email: string;
  message: string;
}): ValidationError[] {
  const errors: ValidationError[] = [
    ...validateName(data.name),
    ...validateEmail(data.email)
  ];
  
  if (!data.message || data.message.trim() === '') {
    errors.push({ field: 'message', message: 'Please provide details about your request' });
  } else if (data.message.length < 20) {
    errors.push({ field: 'message', message: 'Please provide more details (at least 20 characters)' });
  }
  
  return errors;
}

// Compose validators
export function validateFields<T extends Record<string, unknown>>(
  data: T,
  validators: Partial<Record<keyof T, (value: unknown) => ValidationError[]>>
): ValidationResult<T> {
  const allErrors: ValidationError[] = [];
  
  for (const [field, validator] of Object.entries(validators)) {
    if (validator) {
      const fieldErrors = validator(data[field as keyof T]);
      allErrors.push(...fieldErrors);
    }
  }
  
  if (allErrors.length > 0) {
    return { success: false, errors: allErrors };
  }
  
  return { success: true, data, errors: [] };
}
