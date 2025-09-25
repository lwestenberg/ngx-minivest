import { DatePipe, JsonPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MinivestRunResult } from 'ngx-minivest';
import { LoggingService } from '../shared/logging.service';

@Component({
  selector: 'app-debugger',
  imports: [DatePipe, JsonPipe],
  templateUrl: './debugger.html',
  styleUrl: './debugger.css',
})
export class Debugger<T = unknown> {
  readonly formValue = input.required<Partial<T>>();
  readonly ngForm = input<NgForm>();
  readonly minivest = input.required<MinivestRunResult<T>>();
  protected readonly logger = inject(LoggingService);

  clearLogs() {
    this.logger.clear();
  }
}
