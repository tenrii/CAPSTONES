import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { VerifyComponent } from './verify/verify.component';
import { FormControlErrorModule } from '../components/form-control-error/form-control-error.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginPageRoutingModule,
    FormControlErrorModule
  ],
  declarations: [LoginPage, VerifyComponent]
})
export class LoginPageModule {}
