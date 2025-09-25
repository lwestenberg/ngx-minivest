import { enforce, only, staticSuite, test } from 'vest';
import { FormModel } from './example-form-simple.model';

export const validationSuite = staticSuite((model: Partial<FormModel>, field?: string) => {
  if (field) {
    only(field); // For performance - only validate the active field
  }

  test('email', 'Email is required', () => {
    enforce(model.email).isNotEmpty();
  });

  test('email', 'Email must be a valid email address', () => {
    enforce(model.email).matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('verifyEmail', 'Email verification is required', () => {
    enforce(model.verifyEmail).isNotEmpty();
  });

  test('verifyEmail', 'Email verification must be a valid email address', () => {
    enforce(model.verifyEmail).matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  // Cross-field validation: ensure emails match
  test('verifyEmail', 'Email addresses must match', () => {
    enforce(model.verifyEmail).equals(model.email);
  });
});
