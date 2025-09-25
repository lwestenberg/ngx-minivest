import { Routes } from '@angular/router';
import { ExampleFormArray } from './example-form-array/example-form-array';
import { ExampleFormNested } from './example-form-nested/example-form-nested';
import { ExampleFormSimple } from './example-form-simple/example-form-simple';

export const routes: Routes = [
  { path: '', redirectTo: '/form-simple', pathMatch: 'full' },
  { path: 'form-simple', component: ExampleFormSimple },
  { path: 'form-array', component: ExampleFormArray },
  { path: 'form-nested', component: ExampleFormNested },
];
