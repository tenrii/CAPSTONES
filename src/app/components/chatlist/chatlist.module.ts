import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatlistComponent } from './chatlist.component';
import { IonicModule } from '@ionic/angular';
import { DurationAgoModule } from 'src/app/pipes/duration-ago/duration-ago.module';


@NgModule({
  declarations: [ChatlistComponent],
  imports: [
    CommonModule,
    IonicModule,
    DurationAgoModule
  ],
  exports: [ChatlistComponent]
})
export class ChatlistModule { }
