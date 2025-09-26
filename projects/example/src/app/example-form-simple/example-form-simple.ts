import { Component, model } from '@angular/core';
import { createMinivest } from 'ngx-minivest';
import { Debugger } from '../debugger/debugger';
import { FormModel } from './example-form-simple.model';
import { validationSuite } from './example-form.-simplevalidation';

@Component({
  selector: 'app-example-form-simple',
  imports: [Debugger],
  templateUrl: './example-form-simple.html',
})
export class ExampleFormSimple {
  protected readonly formValue = model<Partial<FormModel>>({
    email: '',
    verifyEmail: '',
  });
  protected readonly minivest = createMinivest(this.formValue, validationSuite);

  onSubmit(event: SubmitEvent) {
    console.log(
      this.minivest().submit(event)
        ? '✅ Form validation passed - ready to submit'
        : '❌ Form validation failed',
    );
  }
}
