import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { createMinivest, Path, PathValue } from 'ngx-minivest';
import { Debugger } from '../debugger/debugger';
import { LoggingService } from '../shared/logging.service';
import { NestedFormModel } from './nested-form.model';
import { nestedValidationSuite } from './nested-form.validation';

@Component({
  selector: 'app-nested-form',
  imports: [FormsModule, Debugger],
  templateUrl: './nested-form.html',
})
export class NestedForm {
  protected readonly ngForm = viewChild(NgForm);
  protected readonly logger = inject(LoggingService);

  // Signal to hold nested form state (for UI structure)
  protected readonly formValue = signal<Partial<NestedFormModel>>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
    },
    addressInfo: {
      street: '',
      city: '',
      zipCode: '',
      country: '',
    },
    preferences: {
      newsletter: false,
      notifications: false,
    },
  });

  // Computed signal for vest validation results with NgForm sync (using type assertion for compatibility)
  protected readonly minivest = createMinivest(this.formValue, nestedValidationSuite, this.ngForm);

  setValue(path: Path<NestedFormModel>, value: PathValue<NestedFormModel, Path<NestedFormModel>>) {
    this.logger.log(`Field on path '${path}' changed`, {
      path,
      value,
      currentForm: this.formValue(),
    });

    // Use the setValue method from the minivest result
    this.minivest().setValue(path, value);
  }

  onSubmit() {
    this.ngForm()?.control.markAllAsTouched(); // mark all fields as touched to show NgForm errors
    this.ngForm()?.control.markAllAsDirty(); // mark all fields as dirty to show NgForm errors

    this.logger.log('Nested form submitted', this.formValue());
    const result = nestedValidationSuite(this.formValue());
    this.logger.log('Vest validation result', {
      valid: this.minivest().valid,
      hasErrors: this.minivest().hasErrors(),
      errorCount: this.minivest().errorCount,
    });

    if (this.minivest().valid) {
      this.logger.log('✅ Nested form validation passed - ready to submit');
    } else {
      this.logger.log('❌ Nested form validation failed', {
        errors: result.getErrors(),
      });
    }
  }
}
