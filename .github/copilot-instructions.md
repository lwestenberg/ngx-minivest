# ngx-minivest Copilot Instructions

## Project Overview

This is a minimal Angular 20 application demonstrating Vest.js form validation using signals and standalone components. The architecture is deliberately simple but showcases modern Angular patterns with reactive validation.

## Core Architecture

- **Standalone Bootstrap**: Uses `bootstrapApplication()` in `src/main.ts` - no NgModules
- **Signal-Based State**: Form state managed with `signal()` and `computed()` - no RxJS observables
- **Vest.js Integration**: Custom validation suite in `example-form.validation.ts` using `staticSuite()`
- **Template-Driven Forms**: Uses NgForm with custom signal integration, not reactive forms

## Key Patterns

### Signal-Driven Validation Pattern

```typescript
// Modern pattern using reusable helper
protected readonly formValue = signal<Partial<FormModel>>({});
protected readonly validation = createMinivest(
  this.formValue,
  validationSuite,
  this.ngForm
);
```

### Vest.js Suite Configuration

```typescript
// Critical performance optimization - always use only() for field-specific validation
export const validationSuite = staticSuite((model: Partial<FormModel>, field?: string) => {
  if (field) {
    only(field); // Performance: validate only active field
  }
  // test() calls here
});
```

### Touch-Aware Error Display

The `createMinivest()` helper automatically handles touch-aware errors:

```typescript
// Import the helper
import { createMinivest } from 'ngx-minivest';

// The helper handles touched state automatically
protected readonly validation = createMinivest(
  this.formValue,
  validationSuite,
  this.ngForm  // Optional: enables touch-aware error display
);
```

## Component Architecture

- `App`: Root component with simple navigation layout
- `ExampleFormSimple`: Basic email verification form with Vest.js validation
- `ExampleFormArray`: Dynamic form array with add/remove functionality
- `ExampleFormNested`: Complex nested object validation with deep paths
- `Debugger`: Development utility showing form/validation state in real-time
- `LoggingService`: Signal-based logging with automatic memory management (50 log limit)

## Development Workflow

- **Start**: `pnpm start` (Angular CLI dev server on :4200)
- **Test**: `pnpm test` (Karma + Jasmine)
- **Build**: `pnpm run build` (production optimized)

## Styling & UI

- **Tailwind CSS 4.x**: Modern utility-first styling with `@tailwindcss/postcss`
- **Error States**: Dynamic border colors based on validation state
- **Responsive**: Two-column layout (form + debugger) with mobile-first design

## File Organization

- `src/app/shared/`: Shared services (LoggingService)
- `src/app/example-form-simple/`: Simple form component + validation logic
- `src/app/example-form-array/`: Dynamic array form example
- `src/app/example-form-nested/`: Nested object validation example
- `src/app/debugger/`: Development debugging component
- `projects/ngx-minivest/src/lib/`: Angular library with validation helpers
- Form validation logic is separated into `.validation.ts` files
- Main validation helper in `projects/ngx-minivest/src/lib/helpers.ts`

## Critical Implementation Notes

- Always use `only(field)` in Vest suites for performance
- LoggingService automatically limits logs to prevent memory leaks
- Form uses template-driven approach with signal integration, not reactive forms
- Validation errors only show after field is touched (UX consideration)
- Uses Angular's new control flow (@if, @let) instead of *ngIf/*ngFor
- Use `showErrors()` method instead of `hasErrors()` in templates for touch-aware display
- The `setValue()` method on validation results provides convenient form updates

## When Adding Features

- New form fields: Update `FormModel` interface and add tests to `validationSuite`
- New components: Use standalone components with explicit imports array
- State management: Use signals over observables for simple state
- Validation: Follow the touch-aware error display pattern for good UX
