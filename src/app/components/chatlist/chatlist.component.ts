import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IonSearchbar } from '@ionic/angular';
import { Observable, filter, startWith, map, tap } from 'rxjs';
import { Chat } from 'src/app/shared/chat';

@Component({
  selector: 'app-chatlist',
  templateUrl: './chatlist.component.html',
  styleUrls: ['./chatlist.component.scss'],
})
export class ChatlistComponent implements OnInit, OnDestroy, AfterViewInit {
  public conversations$?: Observable<any>;
  @ViewChild(IonSearchbar) searchBar!: IonSearchbar;
  @Input()
  public isPopover?: boolean = false;
  public conversationFromUrl?: string;
  public timeNow?: number;
  private timerInterval: any;

  constructor(
    public chatService: Chat,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
    this.conversationFromUrl =
      decodeURIComponent(this.route.snapshot.paramMap.get('id') ||
      window.location.pathname.split('/')[2]);
    });
  }

  async ngOnInit() {
    this.conversations$ = await this.chatService.getConversationList();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    // udpate time every 10 seconds
    this.timerInterval = setInterval(() => {
      this.timeNow = new Date().getTime();
    }, 10000);
  }

  ngAfterViewInit(): void {
    if (this.searchBar) {
      const searchFilter$ = this.searchBar.ionChange.pipe(
        map(event => (event.target as HTMLInputElement).value),
        startWith(''),
      );

      // TODO check if safe
      this.chatService.conversationSearchFilter$ = searchFilter$;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  openChat(convo: any) {
    this.router.navigate(['/chatroom', convo]);
  }

}
