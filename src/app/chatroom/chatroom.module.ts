import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatroomPageRoutingModule } from './chatroom-routing.module';

import { ChatroomPage } from './chatroom.page';
import { ChatSectionModule } from '../components/chat-section/chat-section.module';
import { ChatlistModule } from '../components/chatlist/chatlist.module';
import { SiteHeaderModule } from '../components/site-header/site-header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatroomPageRoutingModule,
    ChatSectionModule,
    ChatlistModule,
    SiteHeaderModule
  ],
  declarations: [ChatroomPage]
})
export class ChatroomPageModule {}
