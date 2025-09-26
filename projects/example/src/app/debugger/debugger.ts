import { JsonPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MinivestRunResult } from 'ngx-minivest';

@Component({
  selector: 'app-debugger',
  imports: [JsonPipe],
  templateUrl: './debugger.html',
  styleUrl: './debugger.css',
})
export class Debugger<T = unknown> {
  readonly formValue = input.required<Partial<T>>();
  readonly minivest = input.required<MinivestRunResult<T>>();
}
