import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OwnerLogRegPageRoutingModule } from './owner-log-reg-routing.module';

import { OwnerLogRegPage } from './owner-log-reg.page';
import { VerifyOwnerComponent } from './verify-owner/verify-owner.component';
import { FormControlErrorModule } from '../components/form-control-error/form-control-error.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    OwnerLogRegPageRoutingModule,
    FormControlErrorModule
  ],
  declarations: [OwnerLogRegPage, VerifyOwnerComponent]
})
export class OwnerLogRegPageModule {}
