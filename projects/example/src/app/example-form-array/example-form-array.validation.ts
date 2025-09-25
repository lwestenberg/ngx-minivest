import { enforce, only, staticSuite, test } from 'vest';
import { FormArrayModel } from './example-form-array.model';

export const validationSuite = staticSuite((model: Partial<FormArrayModel>, field?: string) => {
  if (field) {
    only(field); // For performance - only validate the active field
  }

  test('addInterest', 'Interest cannot be empty when adding', () => {
    // This validation only runs when specifically validated (e.g., on add button click)
    if (field === 'addInterest') {
      enforce(model.addInterest).isNotEmpty();
    }
  });

  // Validate individual interests - this handles dynamic field validation
  if (model.interests) {
    Object.keys(model.interests).forEach((key) => {
      const interestValue = model.interests![key];

      test(`interests.${key}`, 'Interest cannot be empty', () => {
        enforce(interestValue).isNotEmpty();
      });

      test(`interests.${key}`, 'Interest must be at least 2 characters', () => {
        enforce(interestValue).longerThan(1);
      });
    });
  }
});
