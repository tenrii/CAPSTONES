import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TenantPanelPageRoutingModule } from './tenant-panel-routing.module';

import { TenantPanelPage } from './tenant-panel.page';
import { ChatlistModule } from '../components/chatlist/chatlist.module';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    TenantPanelPageRoutingModule,
    ChatlistModule
  ],
  declarations: [TenantPanelPage,EditProfileComponent]
})
export class TenantPanelPageModule {}
