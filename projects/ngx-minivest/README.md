# ngx-minivest 🦺

Angular utilities for [Vest.js](https://vestjs.dev) form validation with signals. Seamlessly integrate Vest.js declarative validation with Angular's reactive forms and signals.

## Features

✅ **Signal-based** - Works with Angular signals out of the box  
✅ **Touch-aware** - Shows validation errors only after user interaction  
✅ **Type-safe** - Full TypeScript support with generics  
✅ **Performance optimized** - Field-specific validation support  
✅ **NgForm integration** - Automatic touch state detection  
✅ **Zero dependencies** - Only peer dependencies on Angular and Vest.js

## Installation

```bash
pnpm add ngx-minivest vest
# or
npm install ngx-minivest vest
# or
yarn add ngx-minivest vest
```

## Quick Start

### 1. Create your form model and validation suite

```typescript
import { staticSuite, test, enforce, only } from 'vest';

export interface FormModel {
  email: string;
  password: string;
}

export const validationSuite = staticSuite((model: Partial<FormModel>, field?: string) => {
  if (field) only(field); // Performance: validate only active field

  test('email', 'Email is required', () => {
    enforce(model.email).isNotBlank();
  });

  test('email', 'Must be a valid email', () => {
    enforce(model.email).matches(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/);
  });

  test('password', 'Password must be at least 8 characters', () => {
    enforce(model.password).longerThan(7);
  });
});
```

### 2. Use in your component

```typescript
import { Component, signal, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { createMinivest } from 'ngx-minivest';

@Component({
  selector: 'app-my-form',
  template: `
    <form #ngForm="ngForm" (ngSubmit)="onSubmit()">
      <input
        name="email"
        type="email"
        [ngModel]="formValue().email"
        (ngModelChange)="validation().setValue('email', $event)"
        [class.error]="validation().showErrors('email')"
      />
      @if (validation().showErrors('email')) {
        <div class="error">{{ validation().getErrors('email')[0] }}</div>
      }

      <button [disabled]="!validation().isValid()">Submit</button>
    </form>
  `,
})
export class MyFormComponent {
  protected readonly ngForm = viewChild(NgForm);

  // Form state - you manage this
  protected readonly formValue = signal<Partial<FormModel>>({
    email: '',
    password: '',
  });

  // Validation helper
  protected readonly validation = createMinivest(this.formValue, validationSuite, this.ngForm);

  onSubmit() {
    if (this.validation().isValid()) {
      console.log('Form is valid!', this.formValue());
    }
  }
}
```

## API Reference

### `createMinivest(formValue, suite, ngForm?)`

Creates a computed signal for Vest.js validation with Angular forms integration.

**Parameters:**

- `formValue: Signal<Partial<T>>` - Signal containing form data
- `validationSuite: StaticSuite` - Vest static validation suite function
- `ngForm?: Signal<NgForm | undefined>` - Optional NgForm for touch-aware validation

**Returns:** `Signal<MinivestRunResult<T>>`

### `MinivestRunResult<T>`

The validation result object provides all Vest result methods plus:

- `isValid(): boolean` - Overall form validity
- `hasErrors(path?: string): boolean` - Check for errors at path
- `getErrors(path?: string): string[]` - Get error messages at path
- `showErrors(path?: string): boolean` - Whether to show errors (respects touch state)
- `setValue(path: string, value: any): void` - Convenience method to update form field
- `tests: Record<string, VestTestResult>` - Raw test results
- `errorCount: number` - Total error count
- `warnCount: number` - Total warning count

### Path Support

The library supports deep path validation using dot notation:

```typescript
// For nested objects
validation().setValue('address.street', 'Main St');
validation().showErrors('address.street');

// For arrays
validation().setValue('items.0.name', 'First Item');
validation().getErrors('items.0');
```

## Philosophy

This library follows the Angular way: **you manage state, we handle validation**. You create and manage your own `signal()` for form state, and we provide the validation layer on top.

This approach gives you:

- **Full control** over your form state
- **Flexibility** to integrate with any state management pattern
- **Simplicity** - just one function to learn
- **Transparency** - no hidden state management

## Touch-aware Validation

By default, validation errors only show after a user has interacted with a field (touched it). This provides better UX by not overwhelming users with errors immediately.

Pass an `NgForm` signal to enable this behavior:

```typescript
protected readonly validation = createMinivest(
  this.formValue,
  validationSuite,
  this.ngForm // Enables touch-aware error display
);
```

Use `showErrors()` instead of `hasErrors()` in your templates to respect touch state:

```html
@if (validation().showErrors('email')) {
<div class="error">{{ validation().getErrors('email')[0] }}</div>
}
```

## License

MIT © Lauren Westenberg
