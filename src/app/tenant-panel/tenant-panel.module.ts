import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TenantPanelPageRoutingModule } from './tenant-panel-routing.module';

import { TenantPanelPage } from './tenant-panel.page';
import { ChatlistModule } from '../components/chatlist/chatlist.module';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { SiteHeaderModule } from '../components/site-header/site-header.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    TenantPanelPageRoutingModule,
    ChatlistModule,
    SiteHeaderModule,
  ],
  declarations: [TenantPanelPage],
})
export class TenantPanelPageModule {}
