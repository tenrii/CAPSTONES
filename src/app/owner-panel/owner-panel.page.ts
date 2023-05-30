import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ModalController } from '@ionic/angular';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { Modal1Component } from './modal/modal1/modal1.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
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
  @ViewChild('content', { static: false }) content!: ElementRef;
  @ViewChild('grid', { static: false }) grid!: ElementRef;
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
    public fb: FormBuilder
  ) {}

  ngOnInit() {

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
        })
        return bed;
      }
    })
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

  generatePDF() {
    const doc = new jsPDF();

    const contentElement = this.content.nativeElement;

    const options = {
      width: contentElement.offsetWidth,
      height: contentElement.offsetHeight,
      style: {
        margin: '20px', // Adjust the margin value as per your requirement
      },
    };

    domtoimage.toPng(contentElement, options).then((dataUrl) => {
      const imgWidth = doc.internal.pageSize.getWidth() - 40;
      const imgHeight =
        (contentElement.offsetHeight / contentElement.offsetWidth) * imgWidth;

      doc.addImage(dataUrl, 'PNG', 20, 20, imgWidth, imgHeight);
      doc.save('Records.pdf');
    });
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
      componentProps: {
        record,
      },
    });
    modalInstance.present();
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

  /*deleteTenant(roomId:any, bedId:any, tenantId:any){
      if(bedId){
        this.firestore.collection('Room').doc(roomId).update({
          Bed: this.rooms.value.map((a: any) => {
            console.log('room',a)
            const item = a.Bed?.find((b: any) => b.uid === bedId);
            console.log('bed',item)
            if (item.occupied) {
              delete item.occupied;
            }
            return a;
          }),
      });
        this.firestore.collection('Tenant').doc(tenantId).collection('Reservations').doc(roomId).update({
          status: 'inactive',
        })
        return
      }
      else{
        this.firestore.collection('Room').doc(roomId).update({
          occupied: firebase.firestore.FieldValue.delete(),
        });
        this.firestore.collection('Tenant').doc(tenantId).collection('Reservations').doc(roomId).update({
          status: 'inactive',
        })
      }
      return
      }*/
    }
