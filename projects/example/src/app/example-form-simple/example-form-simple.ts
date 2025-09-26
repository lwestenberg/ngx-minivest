import { Component, inject, model } from '@angular/core';
import { createMinivest, Path, PathValue } from 'ngx-minivest';
import { Debugger } from '../debugger/debugger';
import { LoggingService } from '../shared/logging.service';
import { FormModel } from './example-form-simple.model';
import { validationSuite } from './example-form.-simplevalidation';

@Component({
  selector: 'app-example-form-simple',
  imports: [Debugger],
  providers: [LoggingService],
  templateUrl: './example-form-simple.html',
})
export class ExampleFormSimple {
  protected readonly logger = inject(LoggingService);
  protected readonly formValue = model<Partial<FormModel>>({
    email: '',
    verifyEmail: '',
  });
  protected readonly minivest = createMinivest(this.formValue, validationSuite);

  setValue(path: Path<FormModel>, value: PathValue<FormModel, Path<FormModel>>) {
    this.logger.log(`Field on path '${path}' changed`, { path, value });
    this.minivest().setValue(path, value);
  }

  setTouched(path: Path<FormModel>) {
    this.logger.log(`Field on path '${path}' touched`, { path });
    this.minivest().setTouched(path);
  }

  onSubmit(event: SubmitEvent) {
    const isValid = this.minivest().submit(event);

    if (isValid) {
      this.logger.log('✅ Form validation passed - ready to submit');
    } else {
      this.logger.log('❌ Form validation failed', {
        errors: this.minivest().getErrors(),
      });
    }
  }
}
