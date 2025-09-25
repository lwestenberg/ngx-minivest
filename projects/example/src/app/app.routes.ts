import { Routes } from '@angular/router';
import { ExampleFormArray } from './example-form-array/example-form-array';
import { ExampleForm } from './example-form/example-form';
import { NestedForm } from './nested-form/nested-form';

export const routes: Routes = [
  { path: '', redirectTo: '/simple-form', pathMatch: 'full' },
  { path: 'simple-form', component: ExampleForm },
  { path: 'form-array', component: ExampleFormArray },
  { path: 'nested-form', component: NestedForm },
];
