import { computed, isDevMode, signal, type Signal, type WritableSignal } from '@angular/core';
import type { StaticSuite } from 'vest';
import { MinivestRunResult, Path, PathValue } from './types';

/**
 * Creates a reactive Minivest form handler for managing form state, validation, and field interactions.
 *
 * @template FormModel - The type representing the form's data model.
 * @param formValue - A signal containing the current form values as a partial model.
 * @param validationSuite - A static validation suite function that validates the form values.
 * @returns A computed signal containing the Minivest run result, including validation state, touched fields,
 *          and helper functions for setting field values and marking fields as touched.
 *
 * @remarks
 * - If `formValue` is a writable signal, the returned object includes a `setValue` function to update field values.
 * - If `formValue` is readonly, `setValue` will log a warning in development mode and perform no action.
 * - The `setTouched` function marks a field as touched, updating the internal touched fields state.
 */
export function createMinivest<FormModel>(
  formValue: Signal<Partial<FormModel>>,
  validationSuite: StaticSuite,
): Signal<MinivestRunResult<FormModel>> {
  const touchedFields = signal<Record<Path<FormModel>, boolean>>(
    {} as Record<Path<FormModel>, boolean>,
  );

  return computed((): MinivestRunResult<FormModel> => {
    const result = validationSuite(formValue());

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

    const setTouched = (path?: Path<FormModel>) => {
      if (!path) {
        const allTouched = getAllPaths(formValue() || {}).reduce(
          (acc: Record<Path<FormModel>, boolean>, pathStr: string) => {
            acc[pathStr as Path<FormModel>] = true;
            return acc;
          },
          {} as Record<Path<FormModel>, boolean>,
        );
        touchedFields.set(allTouched);
        return;
      }

      touchedFields.set({ ...touchedFields(), [path]: true });
    };

    return {
      ...result,
      touchedFields: touchedFields(),
      showErrors: getAllPaths(formValue() || {}).reduce(
        (acc: Record<Path<FormModel>, boolean>, path: string) => {
          const typedPath = path as Path<FormModel>;
          acc[typedPath] = result.hasErrors(typedPath) && (touchedFields()[typedPath] ?? false);
          return acc;
        },
        {} as Record<Path<FormModel>, boolean>,
      ),
      setTouched,
      submit: (event) => {
        event.preventDefault();
        setTouched();

        return !!result.valid;
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
 * Recursively collects all possible paths from a nested object.
 * Returns an array of dot-separated path strings.
 *
 * @param obj - The object to extract paths from
 * @param prefix - Current path prefix for recursion
 * @returns Array of all possible paths in the object
 */
function getAllPaths(obj: any, prefix: string = ''): string[] {
  const paths: string[] = [];

  if (obj === null || obj === undefined) {
    return paths;
  }

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      paths.push(currentPath);

      // If the value is an object (but not null or array), recurse
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        paths.push(...getAllPaths(obj[key], currentPath));
      }
    }
  }

  return paths;
}
