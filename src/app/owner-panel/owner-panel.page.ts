import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { Modal1Component } from './modal/modal1/modal1.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, combineLatest, lastValueFrom, map } from 'rxjs';
import { AuthenticationService } from '../shared/authentication-service';
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { EditOwnerProfileComponent } from './edit-owner-profile/edit-owner-profile.component';
import firebase from 'firebase/compat/app';
import { GateawayComponent } from '../components/gateaway/gateaway.component';

@Component({
  selector: 'app-owner-panel',
  templateUrl: './owner-panel.page.html',
  styleUrls: ['./owner-panel.page.scss'],
})
export class OwnerPanelPage implements OnInit {
  @ViewChild('recordsPDF', { static: false }) recordsPDF!: ElementRef;
  @ViewChild('occupantsPDF', { static: false }) occupantsPDF!: ElementRef;
  @ViewChild('roomsPDF', { static: false }) roomsPDF!: ElementRef;
  isButtonDisabled = false;
  roomList!: any[];
  roomForm!: FormGroup;
  room: any[] = [];
  filteredRecord: any[] = [];
  transaction: any[] = [];
  isModalOpen = false;
  uid: any;
  ownerUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public owner: any;
  be: any[] = [];
  ro: any[] = [];
  occupant:any[] = [];
  isSortAscending!: boolean;
  searchText!: string;
  filterlist:any = new BehaviorSubject([]);
  sortBy: any;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  unlisted:any;
  listed:any;

  public notifBtn = new BehaviorSubject('bedspace');
  constructor(
    public authService: AuthenticationService,
    private m: ModalController,
    private af: AngularFireStorage,
    private firestore: AngularFirestore,
    private firebaseService: FirebaseService,
    public afservice:FirebaseService,
    public fb: FormBuilder,
    private alert: AlertController,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.getOwner();
    combineLatest([
      this.firebaseService.read_tenant(),
      this.firebaseService.read_room(),
    ])
      .pipe(
        map(([tenants, rooms]) => {
          return rooms
            .filter((a: any) => {
              return a.OwnerId === this.ownerUid;
            })
            .map((b: any) => {
              b.tenantData = tenants.filter((c: any) => {
                return b.occupied?.userId == c.uid || b.Bed?.some((z: any) => z.occupied?.userId == c.uid);
              });
              return b;
            })
        })
      )
      .subscribe((f: any) => {
        this.room = f;
        this.getLenght();
        console.log('all',this.room);
                /// filteredRecord ///
        this.room.map((a: any) => {
          if (a.occupied) {
            const room = a.tenantData.filter((z:any)=>{
              return a.occupied?.userId === z.uid;
            });
            this.filteredRecord.push({
              FName: room.map((data:any) => data.FName),
              LName: room.map((data:any) => data.FName),
              RoomName: a.RoomName,
              Price: a.Price,
              userId: a.occupied?.userId,
              date: a.occupied?.dateCreated,
              status: a.occupied?.status,
            });
          }
          a.Bed?.map((b: any) => {
            if (b.occupied) {
            const bed = a.tenantData.filter((z:any)=>{
              return b.occupied?.userId === z.uid;
            });
              this.filteredRecord.push({
                FName: bed.map((data:any) => data.FName),
                LName: bed.map((data:any) => data.LName),
                RoomName: a.RoomName,
                id: b.id,
                Price: a.Price,
                bed: b.status,
                userId: b.occupied?.userId,
                date: b.occupied?.dateCreated,
                status: b.occupied?.status,
              });
              return bed;
            }
          });
        });
        this.filteredRecord = this.filteredRecord.sort(
          (a: any, b: any) => (b.dateCreated || 0) - (a.dateCreated || 0)
        );
        console.log('ey', this.filteredRecord);
                /// filteredRecord ///

        this.sortedBed();
        this.sortedRoom();
        this.sortedTenant();

      });

  }

  getLenght(){
    this.room.forEach((a:any)=>{
      if(a.isUnlisted === 'true'){
        const data:any[]=[];
        data.push(a)
        return this.unlisted = data.length;
      }
      else{
      const data:any[]=[];
      data.push(a)
      return this.listed = data.length;
      }
    })
  }

  async getOwner(){
    this.firebaseService.read_owner().subscribe(() => {
      this.owner = this.firebaseService.getOwner(this.ownerUid);
    });
  }

  sortedBed(): any {
    this.room.map((a: any) => {
      a.Bed?.map((b:any) =>{
      if (b.occupied) {
        const bed = a.tenantData.filter((z:any)=>{
          return b.occupied?.userId === z.uid;
        });
          this.be.push({
            FName: bed.map((data:any) => data.FName),
            LName: bed.map((data:any) => data.LName),
            Title: a.Title,
            RoomName: a.RoomName,
            Phone: bed.map((data:any) => data?.Phone),
            Email: bed.map((data:any) => data?.Email),
            Address: bed.map((data:any) => data?.Address),
            profpic: bed.map((data:any) => data.profpic),
            uid: b.id,
            bed: b.status,
            userId: b.occupied?.userId,
            date: b.occupied?.dateCreated,
            status: b.occupied?.status,
          });
          this.be = this.be.sort((a:any,b:any)=>{
           return (b.date || 0 ) - (a.date || 0)
          });
          return bed;
        }
      })
      })
  }

  sortedRoom() {
    this.room.map((a: any) => {
      if (a.occupied) {
        const room = a.tenantData.filter((z:any)=>{
          return a.occupied?.userId === z.uid;
        });
          this.ro.push({
            FName: room.map((data:any) => data.FName),
            LName: room.map((data:any) => data.LName),
            Title: a.Title,
            RoomName: a.RoomName,
            Phone: room.map((data:any) => data?.Phone),
            Email: room.map((data:any) => data?.Email),
            Address: room.map((data:any) => data?.Address),
            profpic: room.map((data:any) => data.profpic),
            uid: a.id,
            userId: a.occupied?.userId,
            date: a.occupied?.dateCreated,
            status: a.occupied?.status,
          });
          this.ro = this.ro.sort((a:any,b:any)=>{
            return (b.date || 0 ) - (a.date || 0)
           });
          return room;
        }
      })
  }

  sortedTenant(){
    this.occupant = [];
    this.room.map((a:any)=>{
      if (a.occupied) {
        const room = a.tenantData.filter((z:any)=>{
          return a.occupied?.userId === z.uid;
        });
        this.occupant.push({
          FName: room.map((data:any) => data.FName),
          LName: room.map((data:any) => data.LName),
          Title: a.Title,
          RoomName: a.RoomName,
          roomId: a.id,
          userId: a.occupied?.userId,
          paymentStatus: a.occupied?.status,
        })
        return room;
      }
      a.Bed?.map((b:any) =>{
        if (b.occupied) {
          const bed = a.tenantData.filter((z:any)=>{
            return b.occupied?.userId === z.uid;
          });
        this.occupant.push({
          FName: bed.map((data:any) => data.FName),
          LName: bed.map((data:any) => data.LName),
          Title: a.Title,
          RoomName: a.RoomName,
          userId: b.occupied?.userId,
          roomId: a.id,
          bedId: b.uid,
          id: b.id,
          bed: b.status,
          paymentStatus: b.occupied?.status
        })

        return bed;
      }
    })
    console.log('occupant',this.occupant)
    return a;
    })

    this.occupant = this.occupant.sort((a:any,b:any)=>{
      const nameA = a.RoomName;
      const nameB = b.RoomName;
        nameA < nameB
      return 0;
     });
  }

  RemoveRecord(rowID: any) {
    this.firebaseService.delete_room(rowID);
  }

  UnlistRoom(id: any) {
    this.firestore.collection('Room').doc(id).update({
      isUnlisted: 'true',
    });
  }

  ListRoom(id: any) {
    this.firestore.collection('Room').doc(id).update({
      isUnlisted: 'false',
    });
  }

  generatePDF(condition:any) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns a zero-based index
    const currentYear = currentDate.getFullYear();

    if(condition === 'records'){
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
    });
  }
  else if (condition === 'occupants') {
      const doc = new jsPDF();

      const occupantsPDFElement = this.occupantsPDF.nativeElement;

      // Remove the "Action" column from the table header
      const tableHeader = occupantsPDFElement.querySelector('.row-header');
      const actionColumnHeader = tableHeader.querySelector('ion-col:last-child');
      actionColumnHeader.remove();

      // Remove the last column from each row body and store the reference to the last column in the first row body
      const rowBodies = occupantsPDFElement.querySelectorAll('.row-body');
      let lastColumn: HTMLElement;
      rowBodies.forEach((row:any, index:any) => {
        const currentLastColumn = row.querySelector('ion-col:last-child');
        if (index === 0) {
          lastColumn = currentLastColumn;
        }
        currentLastColumn.remove();
      });

      const options = {
        width: occupantsPDFElement.offsetWidth,
        height: occupantsPDFElement.offsetHeight,
        style: {
          margin: '20px', // Adjust the margin value as per your requirement
        },
      };

      domtoimage.toPng(occupantsPDFElement, options).then((dataUrl) => {
        const imgWidth = doc.internal.pageSize.getWidth() - 40;
        const imgHeight =
          (occupantsPDFElement.offsetHeight / occupantsPDFElement.offsetWidth) * imgWidth;

        doc.addImage(dataUrl, 'PNG', 20, 20, imgWidth, imgHeight);
        doc.save('Occupants_'+currentMonth+'_'+currentYear+'.pdf');

        // Restore the "Action" column to the table header
        tableHeader.appendChild(actionColumnHeader);

        // Restore the last column to each row body
        rowBodies.forEach((row:any) => {
          row.appendChild(lastColumn.cloneNode(true));
        });
      });
    }
  }


  exportToCSV() {
    const csvContent = this.convertToCSV(this.filteredRecord);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'data_export.csv');
  }

  convertToCSV(room: any[]): string {
    const headers = [
      'Tenant Name',
      'Room/Bedspace Placement',
      'Payment Status',
      'Date of Payment',
    ];
    const rows = [];

    for (const data of room) {
          const rowData = [
            data.FName + ' ' + data.LName,
            `${data.RoomName} / Bed${data.id} ${data.bed}`,
            data.status === 'paidPayment'
              ? `Paid in Full / ${data.Price}`
              : `Pending / ${data.Price}`,
            new Date(data.date).toLocaleString('en-US', {
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

  async gotoModal1() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
        const modalInstance = await this.m.create({
          component: Modal1Component,
          backdropDismiss: false,
          cssClass: 'create-modal',
        });
        this.isModalOpen = true;
        return await modalInstance.present();
      }

  async gotoEditModal(record: any) {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const modalInstance = await this.m.create({
      component: EditModalComponent,
      cssClass: 'create-modal',
      componentProps: {
        record,
      },
    });
    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 1 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  closeModal() {
    this.isModalOpen = false;
    this.m.dismiss();
  }

  toggleSortOrder() {
    this.isSortAscending = !this.isSortAscending;
    this.sortData();
  }

  sortData() {
    console.log(this.sortBy);
    if (this.sortBy === 'date') {
      this.filteredRecord = this.filteredRecord.sort((a: any, b: any) => {
        const dateA = a.date || 0;
        const dateB = b.date || 0;
        return this.isSortAscending ? dateA - dateB : dateB - dateA;
      });
    }
    else if(this.sortBy === 'name'){
      this.filteredRecord = this.filteredRecord.sort((a:any, b:any)=>{
        const nameA = a.FName + ' ' + a.LName;
        const nameB = b.FName + ' ' + b.LName;
        if (nameA < nameB) {
          return this.isSortAscending ? -1 : 1;
        }

        if (nameA > nameB) {
          return this.isSortAscending ? 1 : -1;
        }

        return 0;
      });
    }
  }

  async gotoEditOwnerProfile() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.m.create({
      component: EditOwnerProfileComponent,
      cssClass: 'create-modal',
      componentProps: {
        data: this.owner,
      },
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 1 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoGateaway() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.m.create({
      component: GateawayComponent,
      cssClass: 'create-modal',
      componentProps:{
        ownerId: this.ownerUid,
      },
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal Paymongo dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  filterData() {
    const data = this.filteredRecord.filter((item) => {
      return item.FName.toLowerCase().includes(this.searchText.toLowerCase());
    });
    this.filterlist.next(data);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  getTotalPages() {
    return Math.ceil(this.room.length / this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.room.length / this.itemsPerPage);
  }

  async deleteTenant(roomId:any, bedId:any, tenantId:any){
    if (this.isButtonDisabled) {
      return;
    }

    const alert = await this.alert.create({
      header: 'Delete Tenant',
      message: 'Are you sure you want to delete this tenant?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            await this.deleteTenantHandle(roomId, bedId, tenantId);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteTenantHandle(roomId:any, bedId:any, tenantId:any) {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    // console.log('deleteTenant', roomId, bedId, tenantId);
    try {
      if (bedId) {
        const roomData: any = (await lastValueFrom(this.firestore.collection('Room').doc(roomId).get())).data();
        this.firestore.collection('Room').doc(roomId).update({
          Bed: roomData.Bed.map((bed: any) => {
            if (bed.uid === bedId && bed.occupied) {
              delete bed.occupied;
            }
            return bed;
          }),
        });
        const tenantReservation: any = (await lastValueFrom(this.firestore.collection('Tenant').doc(tenantId).collection('Reservations').doc(roomId).get())).data();
        // console.log('tenantReservation', tenantReservation);
        if (tenantReservation && tenantReservation.lineItems?.length > 1) {
          // if more than one bed
          const remainingBeds = tenantReservation.lineItems.filter((item: any) => item.uid !== bedId);
          // console.log('remainingBeds', remainingBeds);
          await this.firestore.collection('Tenant').doc(tenantId).collection('Reservations').doc(roomId).update({
            lineItems: remainingBeds,
            amount: remainingBeds.reduce((acc: any, item: any) => acc + item.amount, 0),
          });
        } else {
          await this.firestore.collection('Tenant').doc(tenantId).collection('Reservations').doc(roomId).update({
            status: 'inactive',
          });
        }
        this.isButtonDisabled = false;
      } else {
        await this.firestore.collection('Room').doc(roomId).update({
          occupied: firebase.firestore.FieldValue.delete(),
        });
        await this.firestore.collection('Tenant').doc(tenantId).collection('Reservations').doc(roomId).update({
          status: 'inactive',
        })
        this.isButtonDisabled = false;
      }

      const toast = await this.toast.create({
        message: 'Tenant deleted successfully',
        duration: 3000,
      });
      await toast.present();
    } catch (_) {}
  }
}
