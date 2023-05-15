import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Chat } from 'src/app/shared/chat';

@Component({
  selector: 'app-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss'],
})
export class ChatModalComponent implements OnInit {
  public message: string = '';
  private room: any;
  public sending = false;

  constructor(
    public modalController: ModalController,
    public chatService: Chat,
    private toastController: ToastController,
  ) {}

  ngOnInit() {}

  async sendMessage() {
    this.sending = true;
    const [convoId, ] = await this.chatService.getConversation(this.room.OwnerId || this.room.ownerId);
    await this.chatService.addRoomSystemMessage(
      convoId as string,
      this.room
    );
    await this.chatService.addChatMessage(convoId as string, this.message);
    this.toastController.create({
      color: 'success',
      duration: 2000,
      message: 'Message sent!',
    }).then(toast => toast.present());
    this.modalController.dismiss(convoId);
  }

}
