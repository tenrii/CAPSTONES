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
  name: any[] = [];
  date: any[] = [];
  tenantName: any;
  currentSortColumn!: string;
  isSortAscending!: boolean;
  searchText!: string;
  sortBy: any;
  public notifBtn = new BehaviorSubject('bedspace');
  constructor(
    public authService: AuthenticationService,
    private m: ModalController,
    private af: AngularFireStorage,
    private firestore: AngularFirestore,
    private firebaseService: FirebaseService,
    public fb: FormBuilder
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
        console.log('all',this.room);
        this.room.map((a: any) => {
          if (a.occupied) {
            const room = a.tenantData.filter((z:any)=>{
              return a.occupied?.userId === z.uid;
            });
            this.filteredRecord.push({
              FName: room.map((data:any) => data.FName),
              LName: room.map((data:any) => data.FName),
              RoomName: a.RoomName,
              a:'',
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
                b:'',
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
        this.sortedBed();
        this.sortedRoom();
      });

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
            profpic: bed.map((data:any) => data.profpic),
            id: b.id,
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
    console.log('bed', this.be);
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
            profpic: room.map((data:any) => data.profpic),
            id: a.id,
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
    console.log('room', this.ro);
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
    const csvContent = this.convertToCSV(this.room);
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
      let i = 0;
      for (const b of data.Bed) {
        if (b.occupied) {
          for (const tenant of data.tenantData) {
            if (b.occupied?.userId === tenant.id) {
              this.tenantName = `${tenant.FName} ${tenant.LName}`;
            }
          }

          const rowData = [
            this.tenantName || '',
            `Room${i + 1} / Bed${b.id} ${b.status}`,
            b.occupied?.status === 'paidPayment'
              ? `Paid in Full / ${data.Price}`
              : `Pending / ${data.Price}`,
            new Date(b.occupied?.dateCreated).toLocaleString('en-US', {
              dateStyle: 'short',
            }),
          ];

          rows.push(rowData);
        }
      }
      i++;
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

  LogOut() {}

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
      console.log('sort', this.filteredRecord);
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

  filterData(data: any, b: any): boolean {
    if (!this.searchText) {
      return true; // Display all rows when no search term is entered
    }

    const searchTerm = this.searchText.toLowerCase();
    const fullName = data.tenantData
      .map((tenant: any) => tenant.FName + ' ' + tenant.LName)
      .join(' ')
      .toLowerCase();

    // Customize the conditions based on your specific filtering requirements
    return fullName.includes(searchTerm);
    /*if (this.searchText) {
      const searchTerm = this.searchText.toLowerCase();
      console.log('a',searchTerm)
      console.log('b',this.searchText.toLowerCase())
      this.filteredRoom = this.room.filter(data => {
        const fullName = data.tenantData.map((tenant:any) => tenant.FName + ' ' + tenant.LName).join(' ');
        const bedId = data.Bed.map((bed: any) => bed.id)
        const bedStatus = data.Bed.map((status:any) => status.status)
        const bedDate = data.Bed.map((date:any) => date.occupied?.dateCreated)
        console.log('c',fullName.toLowerCase().includes(searchTerm))
        return fullName.toLowerCase().includes(searchTerm);
      });
    } else {
      this.filteredRoom = this.room;
    }*/
  }
}
