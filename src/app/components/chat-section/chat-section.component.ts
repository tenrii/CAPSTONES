import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Observable, filter } from 'rxjs';
import { Chat, Message } from 'src/app/shared/chat';

@Component({
  selector: 'app-chat-section',
  templateUrl: './chat-section.component.html',
  styleUrls: ['./chat-section.component.scss'],
})
export class ChatSectionComponent implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  public chatMateData: any;
  public messages?: Observable<any>;
  public isOwner: boolean | undefined = false;
  private conversationId = '';
  newMsg = '';

  constructor(
    private chatService: Chat,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.load();
    });
  }

  ngOnInit() {}

  async load() {
    const ownerId =
      decodeURIComponent(this.route.snapshot.paramMap.get('id') ||
      window.location.pathname.split('/')[2]);

    if (ownerId.includes('#')) {
      // access via convo list
      const userId = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
      const [realOwnerId, tenantId] = ownerId.split('#');

      if (userId === realOwnerId) {
        this.chatMateData = await this.chatService.getUser('Tenant', tenantId);
      } else {
        this.chatMateData = await this.chatService.getUser('Owner', realOwnerId);
      }
    } else {
      // tenant accessing via contact owner
      this.chatMateData = await this.chatService.getUser('Owner', ownerId);
      // this.chatMateData = this.firebaseService.getOwner(ownerId);
    }

    [this.conversationId, this.messages, this.isOwner] = await this.chatService.getConversation(ownerId) as [string, Observable<Message[]>, boolean];
  }

  sendMessage() {
    this.chatService.addChatMessage(this.conversationId, this.newMsg).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
  }
}

