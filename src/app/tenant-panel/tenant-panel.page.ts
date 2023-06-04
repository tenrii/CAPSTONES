import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from '../services/firebase.service';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { AuthenticationService } from '../shared/authentication-service';
import { ModalController } from '@ionic/angular';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import moment from 'moment';
import { PaymentService } from '../services/payment.service';
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-tenant-panel',
  templateUrl: './tenant-panel.page.html',
  styleUrls: ['./tenant-panel.page.scss'],
})
export class TenantPanelPage implements OnInit {
  @ViewChild('recordsPDF', { static: false }) recordsPDF!: ElementRef;
  tenantUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public tenant: any;
  public page = new BehaviorSubject('bills');
  public billsPage = new BehaviorSubject('unpaid');
  public bills: any[] = [];
  public paidBills: any[] = [];
  transaction: any[] = [];
  sortInBed: any[] = [];
  public isPayButtonLoading = new BehaviorSubject(false);
  isModalOpen: boolean = false;
  isButtonDisabled: boolean = false;

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
        this.transaction = this.transaction.sort(
          (a: any, b: any) => (b.dateCreated || 0) - (a.dateCreated || 0)
        );
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
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
  generatePDF() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns a zero-based index
    const currentYear = currentDate.getFullYear();

    const doc = new jsPDF();

    const recordsPDFElement = this.recordsPDF.nativeElement;

    const options = {
      width: recordsPDFElement.offsetWidth,
      height: recordsPDFElement.offsetHeight,
      style: {
        margin: '20px', // Adjust the margin value as per your requirement
      },
    };

    domtoimage.toPng(recordsPDFElement, options).then((dataUrl) => {
      const imgWidth = doc.internal.pageSize.getWidth() - 40;
      const imgHeight =
        (recordsPDFElement.offsetHeight / recordsPDFElement.offsetWidth) * imgWidth;

      doc.addImage(dataUrl, 'PNG', 20, 20, imgWidth, imgHeight);
      doc.save('Records_'+currentMonth+'_'+currentYear+'.pdf');
    })


}
exportToCSV() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns a zero-based index
  const currentYear = currentDate.getFullYear();
  const csvContent = this.convertToCSV(this.transaction);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'Records'+currentMonth+'_'+currentYear+'.csv');
  }

  convertToCSV(all: any[]): any {
    const headers = [
      'Boarding House Name',
      'Bedspace Placement',
      'Payment Amount',
      'Payment Status',
      'Reference',
      'Date of Payment',
    ];
    const rows = [];

    for (const data of all) {
          const rowData = [
            data.roomData?.Title,
            data.lineItems.map((a:any)=> a.name),
            data.lineItems.map((a:any)=> a.amount),
            data.status === 'paidPayment'
              ? `Paid in Full / ${data.Price}`
              : `Pending / ${data.Price}`,
            data.id,
            new Date(data.dateCreated).toLocaleString('en-US', {
              dateStyle: 'short',
            }),
          ];

          rows.push(rowData);
    }
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
    return csvContent;
  }
}
