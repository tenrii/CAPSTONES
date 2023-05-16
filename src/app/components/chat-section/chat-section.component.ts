import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { IonContent, IonGrid } from '@ionic/angular';
import { Observable, filter } from 'rxjs';
import { Chat, Message } from 'src/app/shared/chat';

@Component({
  selector: 'app-chat-section',
  templateUrl: './chat-section.component.html',
  styleUrls: ['./chat-section.component.scss'],
})
export class ChatSectionComponent implements OnInit, AfterViewInit {
  @ViewChild('content', {read: ElementRef, static: true}) content?: ElementRef;
  public chatMateData: any;
  public messages$?: Observable<any>;
  public roomDetails$?: Observable<any>;
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

  ngAfterViewInit() {
    setTimeout(() => {
      this.content?.nativeElement.scrollToBottom();
    }, 3000);
  }

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

    [this.conversationId, this.messages$, this.isOwner] = await this.chatService.getConversation(ownerId) as [string, Observable<Message[]>, boolean];
    this.roomDetails$ = this.chatService.getConversationLinkedRoom(this.conversationId);
  }

  sendMessage() {
    setTimeout(() => 
      this.content?.nativeElement.scrollToBottom()
    , 200);
    this.content?.nativeElement.scrollToBottom();
    this.chatService.addChatMessage(this.conversationId, this.newMsg).then(() => {
      this.newMsg = '';
      setTimeout(() => {
        this.content?.nativeElement.scrollToBottom();
      }, 100);
    });
  }

  trackByFn(index: any, item: any) {
    return JSON.stringify(item);
  }
}

