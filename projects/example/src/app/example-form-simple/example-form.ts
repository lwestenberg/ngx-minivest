import { Component, inject, model, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { createMinivest, Path, PathValue } from 'ngx-minivest';
import { Debugger } from '../debugger/debugger';
import { LoggingService } from '../shared/logging.service';
import { FormModel } from './example-form.model';
import { validationSuite } from './example-form.validation';

@Component({
  selector: 'app-example-form-simple',
  imports: [FormsModule, Debugger],
  templateUrl: './example-form.html',
})
export class ExampleFormSimple {
  protected readonly ngForm = viewChild(NgForm);
  protected readonly logger = inject(LoggingService);

  // Signal to hold form state
  protected readonly formValue = model<Partial<FormModel>>({
    email: '',
    verifyEmail: '',
  });

  // Computed signal for vest validation results with NgForm sync
  protected readonly minivest = createMinivest(this.formValue, validationSuite, this.ngForm);

  setValue(path: Path<FormModel>, value: PathValue<FormModel, Path<FormModel>>) {
    this.logger.log(`Field on path '${path}' changed`, { path, value });
    this.minivest().setValue(path, value);
  }

  onSubmit() {
    this.ngForm()?.control.markAllAsTouched(); // mark all fields as touched to show NgForm errors
    this.ngForm()?.control.markAllAsDirty(); // mark all fields as dirty to show NgForm errors

    this.logger.log('Form submitted', this.formValue());
    const result = validationSuite(this.formValue());
    this.logger.log('Vest validation result', {
      valid: this.minivest().valid,
      hasErrors: this.minivest().hasErrors(),
      errorCount: this.minivest().errorCount,
    });

    if (this.minivest().valid) {
      this.logger.log('✅ Form validation passed - ready to submit');
    } else {
      this.logger.log('❌ Form validation failed', {
        errors: result.getErrors(),
      });
    }
  }
}
