import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from '../services/firebase.service';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { AuthenticationService } from '../shared/authentication-service';
import { ModalController } from '@ionic/angular';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import moment from 'moment';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-tenant-panel',
  templateUrl: './tenant-panel.page.html',
  styleUrls: ['./tenant-panel.page.scss'],
})
export class TenantPanelPage implements OnInit {
  tenantUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public tenant: any;
  public page = new BehaviorSubject('bills');
  public billsPage = new BehaviorSubject('unpaid');
  public bills: any[] = [];
  public paidBills: any[] = [];

  transaction: any[] = [];
  sortInBed: any[] = [];
  isButtonDisabled: boolean = false;
  public isPayButtonLoading = new BehaviorSubject(false);

  constructor(
    public authService: AuthenticationService,
    private firestore: AngularFirestore,
    private firebaseService: FirebaseService,
    private m: ModalController,
    private paymentService: PaymentService
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
              d.ownerData = owners.find((e: any) => e.id == d.roomData?.ownerId);
              return d;
            });
        })
      )
      .subscribe((f: any) => {
        this.transaction = f;
        this.sortedBed();
        // console.log('a', f);
      });

    combineLatest([
      this.firestore.collection('Tenant').doc(this.tenantUid).collection('Reservations').valueChanges(),
      this.firebaseService.read_room(),
    ])
      .pipe(
        map(([reservations, rooms]) => {
          return reservations
            .filter((a: any) =>  a.status === 'active')
            .map((reservation: any) => {
              const reservationRoom = rooms.find((a: any) => a.id == reservation.roomId);
              reservation.roomData = reservationRoom;
              reservation.lastPaymentMonth = reservation?.payments?.length > 0 ? reservation?.payments.sort((a: any, b: any) => b.monthDate - a.monthDate)[reservation?.payments?.length - 1].monthDate : reservation?.dateCreated;
              reservation.nextPaymentMonth = moment(reservation.lastPaymentMonth).add(1, 'month').toDate();
              return reservation;
            });
        })
      )
      .subscribe((d: any) => {
        // TODO optimize
        this.bills = d;
        this.paidBills = [];
        this.bills.forEach((bill: any) => {
          this.paidBills.push(...bill.payments.map((payment: any) => {
            payment.roomData = bill.roomData;
            return payment;
          }))
        });
        this.paidBills = this.paidBills.sort((a: any, b: any) => b.dateCreated - a.dateCreated);
      });

  }

  async getTenant() {
    this.firebaseService.read_tenant().subscribe(() => {
      this.tenant = this.firebaseService.getTenant(this.tenantUid);
    });
  }

  sortedBed(): any {
    const bed = this.transaction.map((a: any) => {
      a.roomData.Bed = a.roomData?.Bed?.sort(
        (a: any, b: any) =>
          (b.occupied?.dateCreated || 0) - (a.occupied?.dateCreated || 0)
      );
      return a;
    });
    this.sortInBed = bed;
    // console.log('x', this.sortInBed);
  }

  async payBill(bill: any) {
    this.isPayButtonLoading.next(true);
    try {
      const response = await this.paymentService.createPaymentSession(bill.roomId, 'monthly-bill');
      window.location.replace(response.checkoutUrl);
    } catch (e) {
      this.isPayButtonLoading.next(false);
    }
  }

  async gotoEditProfile() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.m.create({
      component: EditProfileComponent,
      cssClass: 'create-modal',
      componentProps: {
        data: this.tenant,
      },
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 1 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
