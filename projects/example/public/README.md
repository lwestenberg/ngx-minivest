# ngx-minivest 🦺

A minimal Angular 20 demo showcasing modern form validation with [Vest.js](https://vestjs.dev) using signals and standalone components.

## What This Example Demonstrates

This project shows how to build reactive forms in Angular using modern patterns:

- **Signals over Observables**: Form state managed with Angular signals instead of RxJS
- **Vest.js Integration**: Declarative validation rules that feel like unit tests
- **Standalone Architecture**: No NgModules - pure component-based app structure
- **Performance Optimized**: Field-specific validation using Vest's `only()` function
- **Developer Experience**: Real-time debugging panel showing form and validation state

## Examples Included

The demo includes three comprehensive form examples:

### 1. Simple Form (`/simple-form`)

- Email input with format validation
- Confirm email input with matching validation
- Real-time error display (only after field interaction)

### 2. Form Array (`/form-array`)

- Dynamic list of items with add/remove functionality
- Individual validation for each array item
- Array-level validation rules

### 3. Nested Form (`/nested-form`)

- Complex nested object validation
- Deep path validation with dot notation
- Hierarchical error display

## Quick Start

```bash
pnpm install
pnpm start
```

Open [http://localhost:4200](http://localhost:4200) to explore the demo.

## Architecture Highlights

### Signal-Based State Management

Instead of reactive forms, this uses Angular signals for form state:

```typescript
protected readonly formValue = signal<Partial<FormModel>>({});
protected readonly validation = createMinivest(
  this.formValue,
  validationSuite,
  this.ngForm
);
```

### Vest.js Validation Suite

Validation rules are defined like unit tests with performance optimization:

```typescript
export const validationSuite = staticSuite((model, field?) => {
  if (field) only(field); // Only validate specific field for performance

  test('email', 'Email is required', () => {
    enforce(model.email).isNotEmpty();
  });
});
```

### Touch-Aware UX Pattern

Errors only appear after user interaction, preventing premature error states:

```typescript
// Automatically handled by the validation helper
@if (validation().showErrors('email')) {
  <div class="error">{{ validation().getErrors('email')[0] }}</div>
}
```

## Project Structure

```
projects/
├── example/                # Demo application
│   └── src/app/
│       ├── example-form/           # Simple form example
│       ├── example-form-array/     # Dynamic form array example
│       ├── nested-form/            # Nested object validation example
│       ├── debugger/               # Real-time debugging component
│       ├── shared/                 # Shared utilities
│       └── app.ts                  # Root standalone component
└── ngx-minivest/           # Angular library
    └── src/lib/
        ├── helpers.ts              # Main createMinivest function
        ├── types.ts                # TypeScript definitions
        └── index.ts                # Public API exports
```

## What You'll Learn

- How to integrate Vest.js with Angular signals using `createMinivest`
- Performance optimization patterns for form validation
- Modern Angular standalone component architecture
- Touch-aware error display patterns for better UX
- Signal-driven state management without RxJS
- Complex form patterns: arrays, nested objects, and deep validation
- Building reusable Angular libraries with ng-packagr

## Commands

- `pnpm start` - Development server (example app)
- `pnpm test` - Run tests for example app
- `pnpm run build` - Production build of example app
- `pnpm run build:lib` - Build the ngx-minivest library
- `pnpm run build:lib:watch` - Build library in watch mode
- `pnpm run test:lib` - Run library tests

## Using the Library

To use ngx-minivest in your own projects:

```bash
pnpm add ngx-minivest vest
```

See the [library documentation](https://github.com/lwestenberg/ngx-minivest/tree/main/projects/ngx-minivest) for detailed usage instructions.
