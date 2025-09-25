import { StaticSuite } from 'vest';

type StaticSuiteRunResult = ReturnType<StaticSuite>;

export type MinivestRunResult<FormModel> = StaticSuiteRunResult & {
  /** Convenience method to update form field values */
  setValue(path: Path<FormModel>, value: PathValue<FormModel, Path<FormModel>>): void;

  /** Check if errors should be shown (optionally for specific field with touch-aware behavior) */
  showErrors: (path?: Path<FormModel>) => boolean;
};

export type Path<T> = T extends object
  ? {
      [K in keyof T & string]: K | (T[K] extends object ? `${K}.${Path<T[K]>}` : K);
    }[keyof T & string]
  : never;

export type PathValue<T, P extends Path<T>> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Rest extends Path<T[K]>
        ? PathValue<T[K], Rest>
        : never
      : never
    : never;
