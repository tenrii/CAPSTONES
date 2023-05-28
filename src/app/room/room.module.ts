import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoomPageRoutingModule } from './room-routing.module';

import { RoomPage } from './room.page';
import { ChatModalComponent } from './chat-modal/chat-modal.component';
import { SiteHeaderModule } from '../components/site-header/site-header.module';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RoomPageRoutingModule,
    SiteHeaderModule,
    GalleryModule,
    LightboxModule.withConfig({ panelClass: 'fullscreen' }),
  ],
  declarations: [RoomPage, ChatModalComponent],
})
export class RoomPageModule {}
