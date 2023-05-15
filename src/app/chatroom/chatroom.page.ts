import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Chat, Message } from '../shared/chat';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.page.html',
  styleUrls: ['./chatroom.page.scss'],
})
export class ChatroomPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  public chatMateData: any;
  public messages?: Observable<any>;
  private conversationId = '';
  newMsg = '';

  constructor(
    private chatService: Chat,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // this.load();
    // TODO if no chat in param open first chat
  }

  // async load() {
  //   const ownerId =
  //     decodeURIComponent(this.route.snapshot.paramMap.get('id') ||
  //     window.location.pathname.split('/')[2]);

  //   if (ownerId.includes('#')) {
  //     // access via convo list
  //     const userId = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  //     const [realOwnerId, tenantId] = ownerId.split('#');

  //     if (userId === realOwnerId) {
  //       this.chatMateData = await this.chatService.getUser('Tenant', tenantId);
  //     } else {
  //       this.chatMateData = await this.chatService.getUser('Owner', realOwnerId);
  //     }
  //   } else {
  //     // tenant accessing via contact owner
  //     this.chatMateData = await this.chatService.getUser('Owner', ownerId);
  //     // this.chatMateData = this.firebaseService.getOwner(ownerId);
  //   }

  //   [this.conversationId, this.messages] = await this.chatService.getConversation(ownerId) as [string, Observable<Message[]>];
  // }

}
