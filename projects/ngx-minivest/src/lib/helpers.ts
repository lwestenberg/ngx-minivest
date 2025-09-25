import { computed, isDevMode, type Signal, type WritableSignal } from '@angular/core';
import type { NgForm } from '@angular/forms';
import type { StaticSuite } from 'vest';
import { MinivestRunResult, Path, PathValue } from './types';

/**
 * Creates a reactive Minivest validation result signal for a given form model.
 *
 * This function runs the provided validation suite against the current form value,
 * and returns a signal containing the validation result, error display logic, and
 * a setValue function (if the form value signal is writable).
 *
 * When an NgForm is provided, it automatically syncs Vest.js validation errors
 * directly to the Angular form controls, creating a seamless integration between
 * Vest.js validation and Angular's template-driven forms.
 *
 * @typeParam FormModel - The type representing the form's data model.
 * @param formValue - A signal holding the current (partial) form value.
 * @param validationSuite - The static validation suite to run against the form value.
 * @param ngForm - (Optional) A signal holding the Angular form instance, used for touched state and error sync.
 * @returns A signal containing the Minivest validation result, error display logic, and setValue function.
 */
export function createMinivest<FormModel>(
  formValue: Signal<Partial<FormModel>>,
  validationSuite: StaticSuite,
  ngForm?: Signal<NgForm | undefined>,
): Signal<MinivestRunResult<FormModel>> {
  return computed((): MinivestRunResult<FormModel> => {
    const result = validationSuite(formValue());
    const form = ngForm?.();

    // Sync validation errors to NgForm if provided
    if (form?.form) {
      syncValidationErrorsToNgForm(form, result);
    }

    // Create setValue function using the helper, but only if formValue is writable
    const setValue = isWritableSignal(formValue)
      ? createSetValue(formValue)
      : <F>(path: Path<F>, value: PathValue<F, Path<F>>) => {
          if (isDevMode()) {
            console.warn(
              'Cannot setValue on a readonly signal. Pass a WritableSignal to enable setValue functionality.',
            );
          }
        };

    return {
      ...result,
      showErrors: (path?: Path<FormModel>) => {
        if (path) {
          // Show errors only if field has errors AND is touched (or no form provided)
          if (form) {
            const control = form.form.get(path);
            return result.hasErrors(path) && (control?.touched ?? false);
          }
          return result.hasErrors(path);
        }
        return result.hasErrors();
      },
      setValue,
    };
  });
}

/**
 * Creates a setter function for updating a nested value within a form model signal.
 *
 * This utility allows you to update deeply nested properties in a form model
 * managed by a WritableSignal, using a dot-separated path string.
 *
 * @template FormModel - The type representing the form model.
 * @param formSignal - A WritableSignal containing a partial form model object.
 * @returns A function that takes a path (dot-separated string) and a value,
 *          and updates the corresponding property in the form model signal.
 *
 * @typeParam F - The type of the form model (defaults to FormModel).
 * @param path - The dot-separated string path to the property to update.
 * @param value - The new value to set at the specified path.
 *
 * @example
 * ```typescript
 * const setValue = createSetValue(formSignal);
 * setValue('address.street', 'Main St');
 * ```
 */
function createSetValue<FormModel>(
  formSignal: WritableSignal<Partial<FormModel>>,
): <F = FormModel>(path: Path<F>, value: PathValue<F, Path<F>>) => void {
  return <F>(path: Path<F>, value: PathValue<F, Path<F>>) => {
    const currentFormValue = formSignal();
    const keys = (path as string).split('.');
    const result = { ...currentFormValue };
    let current: any = result;

    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      } else {
        current[key] = { ...current[key] };
      }
      current = current[key];
    }

    // Set the final value
    current[keys[keys.length - 1]] = value;
    formSignal.set(result);
  };
}

/**
 * Type guard to check if a signal is writable
 */
function isWritableSignal<T>(signal: Signal<T>): signal is WritableSignal<T> {
  return 'set' in signal && typeof (signal as WritableSignal<T>).set === 'function';
}

/**
 * Syncs Vest.js validation errors directly to NgForm controls.
 * This sets the validation errors from Vest.js onto the corresponding form controls,
 * maintaining the same structure as Vest.js validation results.
 */
function syncValidationErrorsToNgForm(ngForm: NgForm, vestResult: any): void {
  const form = ngForm.form;

  // Set validation errors directly from Vest.js results
  Object.keys(form.controls).forEach((fieldName) => {
    const control = form.get(fieldName);
    if (control) {
      // Set errors directly from Vest.js (null if no errors)
      if (vestResult.hasErrors(fieldName)) {
        const errors = vestResult.getErrors(fieldName);
        // Use 'vest' as the error key with the actual error message as the value
        // This keeps it simple and maintains the Vest.js error structure
        control.setErrors({ vest: errors[0] || 'Validation failed' });
      } else {
        control.setErrors(null);
      }
    }
  });
}
