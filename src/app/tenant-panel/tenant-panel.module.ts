import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TenantPanelPageRoutingModule } from './tenant-panel-routing.module';

import { TenantPanelPage } from './tenant-panel.page';
import { ChatlistModule } from '../components/chatlist/chatlist.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TenantPanelPageRoutingModule,
    ChatlistModule
  ],
  declarations: [TenantPanelPage]
})
export class TenantPanelPageModule {}
