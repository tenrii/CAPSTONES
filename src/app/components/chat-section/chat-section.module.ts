import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSectionComponent } from './chat-section.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [ChatSectionComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule
  ],
  exports: [ChatSectionComponent]
})
export class ChatSectionModule { }
