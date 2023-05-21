import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteHeaderComponent } from './site-header.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [SiteHeaderComponent],
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
  ],
  exports: [SiteHeaderComponent]
})
export class SiteHeaderModule { }
