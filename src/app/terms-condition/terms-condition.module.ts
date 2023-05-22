import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermsConditionPageRoutingModule } from './terms-condition-routing.module';

import { TermsConditionPage } from './terms-condition.page';
import { SiteHeaderModule } from '../components/site-header/site-header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsConditionPageRoutingModule,
    SiteHeaderModule,
  ],
  declarations: [TermsConditionPage],
})
export class TermsConditionPageModule {}
