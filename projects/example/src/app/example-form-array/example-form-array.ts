import { KeyValuePipe } from '@angular/common';
import { Component, inject, model, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { createMinivest } from 'ngx-minivest';
import { Debugger } from '../debugger/debugger';
import { LoggingService } from '../shared/logging.service';
import { FormArrayModel } from './example-form-array.model';
import { validationSuite } from './example-form-array.validation';

/**
 * Utility function to convert array to object with numeric keys
 * Example: ['foo', 'bar', 'baz'] => {0: 'foo', 1: 'bar', 2: 'baz'}
 */
function arrayToObject<T>(arr: T[]): { [key: number]: T } {
  return arr.reduce((acc, value, index) => ({ ...acc, [index]: value }), {});
}

@Component({
  selector: 'app-example-form-array',
  imports: [FormsModule, KeyValuePipe, Debugger],
  templateUrl: './example-form-array.html',
})
export class ExampleFormArray {
  protected readonly ngForm = viewChild(NgForm);
  protected readonly logger = inject(LoggingService);

  // Expose Object for use in template
  protected readonly Object = Object;

  // Signal to hold form state
  protected readonly formValue = model<Partial<FormArrayModel>>({
    addInterest: '',
    interests: {},
  });

  // Computed signal for vest validation results with NgForm sync
  protected readonly minivest = createMinivest(this.formValue, validationSuite, this.ngForm);

  // TrackBy function for ngFor performance
  protected readonly tracker = (index: number) => index;

  /**
   * Helper method to check errors for dynamic field paths
   */
  protected hasInterestError(key: string): boolean {
    return this.minivest().hasErrors(`interests.${key}` as any);
  }

  /**
   * Helper method to show errors for dynamic field paths (touch-aware)
   */
  protected showInterestError(key: string): boolean {
    return this.minivest().showErrors(`interests.${key}` as any);
  }

  /**
   * Helper method to get errors for dynamic field paths
   */
  protected getInterestErrors(key: string): string[] {
    return this.minivest().getErrors(`interests.${key}` as any) || [];
  }

  /**
   * Helper method to get the count of interests
   */
  protected getInterestsCount(): number {
    return Object.keys(this.formValue().interests || {}).length;
  }

  setValue(path: string, value: any) {
    this.logger.log(`Field on path '${path}' changed`, { path, value });
    this.minivest().setValue(path as any, value);
  }

  /**
   * Add a new interest to the form array
   */
  protected addInterest(): void {
    const currentFormValue = this.formValue();

    // Validate the addInterest field first
    const addInterestValidation = validationSuite(currentFormValue, 'addInterest');

    if (addInterestValidation.hasErrors('addInterest')) {
      this.logger.log('❌ Cannot add interest - validation failed', {
        errors: addInterestValidation.getErrors('addInterest'),
      });
      return;
    }

    if (!currentFormValue.addInterest?.trim()) {
      this.logger.log('❌ Cannot add empty interest');
      return;
    }

    // Create new array with all existing interests plus the new one
    const existingInterests = Object.values(currentFormValue.interests || {});
    const newInterests = [...existingInterests, currentFormValue.addInterest.trim()];

    // Convert array back to object with numeric keys
    const interests = arrayToObject(newInterests);

    // Update form value
    this.minivest().setValue('interests', interests);

    this.logger.log('✅ Interest added successfully', {
      newInterest: currentFormValue.addInterest,
      totalInterests: newInterests.length,
    });
  }

  /**
   * Remove an interest by key (index)
   */
  protected removeInterest(key: string): void {
    const currentFormValue = this.formValue();
    const existingInterests = Object.values(currentFormValue.interests || {});

    if (existingInterests.length === 0) {
      this.logger.log('❌ No interests to remove');
      return;
    }

    // Filter out the interest at the specified index
    const newInterests = existingInterests.filter((_, index) => index !== Number(key));

    // Convert filtered array back to object with numeric keys
    const interests = arrayToObject(newInterests);

    // Update form value
    this.minivest().setValue('interests', interests);

    this.logger.log('✅ Interest removed successfully', {
      removedIndex: key,
      remainingInterests: newInterests.length,
    });
  }

  onSubmit() {
    const form = this.ngForm();
    if (form) {
      form.control.markAllAsTouched(); // mark all fields as touched to show NgForm errors
      form.control.markAllAsDirty(); // mark all fields as dirty to show NgForm errors
    }

    this.logger.log('Form submitted', this.formValue());
    const result = validationSuite(this.formValue());
    this.logger.log('Vest validation result', {
      valid: this.minivest().valid,
      hasErrors: this.minivest().hasErrors(),
      errorCount: this.minivest().errorCount,
    });

    if (this.minivest().valid) {
      this.logger.log('✅ Form validation passed - ready to submit');
      // Here you would typically send the data to a server
      // Note: Convert interests object back to array if needed for API
      const submitData = {
        ...this.formValue(),
        interests: Object.values(this.formValue().interests || {}),
      };
      this.logger.log('📤 Submitting data:', submitData);
    } else {
      this.logger.log('❌ Form validation failed', {
        errors: result.getErrors(),
      });
    }
  }
}
