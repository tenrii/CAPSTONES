import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormControlErrorComponent } from './form-control-error.component';

@NgModule({
  declarations: [FormControlErrorComponent],
  exports: [FormControlErrorComponent],
  imports: [CommonModule],
})
export class FormControlErrorModule {}
