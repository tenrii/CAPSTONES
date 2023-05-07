import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-tenant-panel',
  templateUrl: './tenant-panel.page.html',
  styleUrls: ['./tenant-panel.page.scss'],
})
export class TenantPanelPage implements OnInit {
  tenantUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public tenant: any;
  constructor(
    private firestore: AngularFirestore,
    private firebaseService: FirebaseService,
  ) {

}

  ngOnInit() {
    if (!this.firebaseService.loading) {
      this.firebaseService.read_tenant().subscribe(() => {
        console.log('a',this.tenantUid)
        this.tenant = this.firebaseService.getTenant(this.tenantUid);
        console.log('b',this.tenant)
      });
      return;
    }
  }

}
