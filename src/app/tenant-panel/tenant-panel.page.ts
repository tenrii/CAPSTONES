import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from '../services/firebase.service';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-tenant-panel',
  templateUrl: './tenant-panel.page.html',
  styleUrls: ['./tenant-panel.page.scss'],
})
export class TenantPanelPage implements OnInit {
  tenantUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public tenant: any;
  paid: any[] = [];
  pending: any[] = [];
  transaction: any[] = [];
  sortInBed: any[] = [];
  constructor(
    private firestore: AngularFirestore,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.getTenant();
    combineLatest([
      this.firebaseService.read_transaction(),
      this.firebaseService.read_room(),
      this.firebaseService.read_owner(),
    ])
      .pipe(
        map(([transactions, rooms, owners]) => {
          return transactions
            .filter((a: any) => {
              return a.userId === this.tenantUid;
            })
            .map((b: any) => {
              b.roomData = rooms.find((c: any) => c.id == b.roomId);
              return b;
            })
            .map((d: any) => {
              d.ownerData = owners.find((e: any) => e.id == d.roomData.ownerId);
              return d;
            });
        })
      )
      .subscribe((f: any) => {
        this.transaction = f;
        this.sortedBed();
        console.log('a', f);
      });

    combineLatest([
      this.firebaseService.read_transaction(),
      this.firebaseService.read_room(),
    ])
      .pipe(
        map(([transactions, rooms]) => {
          return transactions
            .filter((a: any) => {
              return a.status === 'pending' && a.userId === this.tenantUid;
            })
            .map((b: any) => {
              b.roomData = rooms.find((c: any) => c.id == b.roomId);
              return b;
            });
        })
      )
      .subscribe((d: any) => {
        this.pending = d;
        console.log('a', d);
      });

    combineLatest([
      this.firebaseService.read_transaction(),
      this.firebaseService.read_room(),
    ])
      .pipe(
        map(([transactions, rooms]) => {
          return transactions
            .filter((a: any) => {
              return a.status === 'paid' && a.userId === this.tenantUid;
            })
            .map((b: any) => {
              b.roomData = rooms.find((c: any) => c.id == b.roomId);
              return b;
            });
        })
      )
      .subscribe((d: any) => {
        this.paid = d;
        console.log('a', d);
      });
  }

  async getTenant() {
    this.firebaseService.read_tenant().subscribe(() => {
      this.tenant = this.firebaseService.getTenant(this.tenantUid);
    });
  }

  sortedBed(): any {
    const bed = this.transaction.map((a: any) => {
      a.roomData.Bed = a.roomData.Bed?.sort(
        (a: any, b: any) =>
          (b.occupied?.dateCreated || 0) - (a.occupied?.dateCreated || 0)
      );
      return a;
    });
    this.sortInBed = bed;
    console.log('x', this.sortInBed);
  }
}
