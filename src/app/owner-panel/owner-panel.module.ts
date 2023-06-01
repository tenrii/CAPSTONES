import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwnerPanelPageRoutingModule } from './owner-panel-routing.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { OwnerPanelPage } from './owner-panel.page';
import { EditModalComponent } from './edit-modal/edit-modal.component';

import { Modal1Component } from './modal/modal1/modal1.component';
import { Modal2Component } from './modal/modal2/modal2.component';
import { Modal3Component } from './modal/modal3/modal3.component';
import { Modal4Component } from './modal/modal4/modal4.component';
import { Modal5Component } from './modal/modal5/modal5.component';
import { Modal6Component } from './modal/modal6/modal6.component';
import { Modal7Component } from './modal/modal7/modal7.component';
import { Modal8Component } from './modal/modal8/modal8.component';
import { Modal9Component } from './modal/modal9/modal9.component';
import { Modal10Component } from './modal/modal10/modal10.component';
import { Modal11Component } from './modal/modal11/modal11.component';
import { Modal12Component } from './modal/modal12/modal12.component';
import { Modal13Component } from './modal/modal13/modal13.component';
import { Modal14Component } from './modal/modal14/modal14.component';
import { Modal15Component } from './modal/modal15/modal15.component';
import { ChatlistModule } from '../components/chatlist/chatlist.module';
import { NgxFileDropModule } from 'ngx-file-drop';
import { EditOwnerProfileComponent } from './edit-owner-profile/edit-owner-profile.component';
import { SiteHeaderModule } from '../components/site-header/site-header.module';
import { GateawayComponent } from '../components/gateaway/gateaway.component';
import { KeyComponent } from '../components/gateaway/key/key.component';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OwnerPanelPageRoutingModule,
    Ng2SearchPipeModule,
    NgxFileDropModule,
    ChatlistModule,
    SiteHeaderModule,
    GalleryModule,
    LightboxModule,
  ],
  declarations: [
    OwnerPanelPage,
    EditModalComponent,
    Modal1Component,
    Modal2Component,
    Modal3Component,
    Modal4Component,
    Modal5Component,
    Modal6Component,
    Modal7Component,
    Modal8Component,
    Modal9Component,
    Modal10Component,
    Modal11Component,
    Modal12Component,
    Modal13Component,
    Modal14Component,
    Modal15Component,
    EditOwnerProfileComponent,
    GateawayComponent,
    KeyComponent,
  ],
})
export class OwnerPanelPageModule {}
