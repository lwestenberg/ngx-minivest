import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createMinivest, Path, PathValue } from 'ngx-minivest';
import { Debugger } from '../debugger/debugger';
import { NestedFormModel } from './example-form-nested.model';
import { nestedValidationSuite } from './example-form-nested.validations';

@Component({
  selector: 'app-example-form-nested',
  imports: [FormsModule, Debugger],
  templateUrl: './example-form-nested.html',
})
export class ExampleFormNested {
  protected readonly Object = Object; // Make Object available in template

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

  protected readonly minivest = createMinivest(this.formValue, nestedValidationSuite);

  setValue(path: Path<NestedFormModel>, value: PathValue<NestedFormModel, Path<NestedFormModel>>) {
    console.log(`Field on path '${path}' changed`, {
      path,
      value,
      currentForm: this.formValue(),
    });

    // Use the setValue method from the minivest result
    this.minivest().setValue(path, value);
  }

  setTouched(path: Path<NestedFormModel>) {
    console.log(`Field on path '${path}' touched`, { path });
    this.minivest().setTouched(path);
  }

  onSubmit(event: SubmitEvent) {
    console.log('Nested form submitted', this.formValue());
    const isValid = this.minivest().submit(event);

    if (isValid) {
      console.log('✅ Nested form validation passed - ready to submit');
    } else {
      console.log('❌ Nested form validation failed', {
        errors: this.minivest().getErrors(),
      });
    }
  }
}
