import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Chat } from 'src/app/shared/chat';

@Component({
  selector: 'app-chatlist',
  templateUrl: './chatlist.component.html',
  styleUrls: ['./chatlist.component.scss'],
})
export class ChatlistComponent implements OnInit {
  public conversations$?: Observable<any>;
  @Input()
  public isPopover?: boolean = false;

  constructor(
    private chatService: Chat,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.conversations$ = await this.chatService.getConversationList();
  }

  openChat(convo: any) {
    console.log('open chat', convo);
    this.router.navigate(['/chatroom', convo]);
  }

}
