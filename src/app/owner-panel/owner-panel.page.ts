import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ModalController } from '@ionic/angular';
import { CreateModalComponent } from './create-modal/create-modal.component';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { Modal1Component } from './modal/modal1/modal1.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, map } from 'rxjs';
import { AuthenticationService } from '../shared/authentication-service';
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-owner-panel',
  templateUrl: './owner-panel.page.html',
  styleUrls: ['./owner-panel.page.scss'],
})
export class OwnerPanelPage implements OnInit {
  @ViewChild('content', { static: false }) content!: ElementRef;
  @ViewChild('grid', { static: false }) grid!: ElementRef;

  roomList!: any[];
  roomForm!: FormGroup;
  room: any[]=[];
  transaction: any[]=[];
  isModalOpen = false;
  uid: any;
  ownerUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public owner: any;
  be:any[]=[];
  ro:any[]=[];
  tenantName: any;
  currentSortColumn!: string;
  isSortAscending!: boolean;
  searchText!: string;
  sortBy:any;
  filteredRoom: any[]=[];


  constructor(
    public authService: AuthenticationService,
    private m: ModalController,
    private af: AngularFireStorage,
    private firestore: AngularFirestore,
    private firebaseService: FirebaseService,
    public fb: FormBuilder
  ) {
  }

  ngOnInit() {

    combineLatest([this.firebaseService.read_tenant(),
      this.firebaseService.read_room()]).pipe(
        map(([tenants, rooms]) =>{
        return rooms.filter((a: any) =>{
          return a.ownerId === this.ownerUid
        }).map((b:any)=>{
          b.tenantData = tenants.filter((c:any) => {
            return b.Bed?.some((z: any) => z.occupied?.userId == c.id)
          })
          return b
        })
        })
      ).subscribe((d:any) =>{
        this.room = d
        this.filteredRoom = this.room
        this.sortedBed();
        this.sortedRoom();
      })

    if (!this.firebaseService.loading) {
      this.firebaseService.read_owner().subscribe(() => {
        this.owner = this.firebaseService.getOwner(this.ownerUid);
      });
      return;
    }
  }

  sortedBed():any{
      const bed = this.room.map((z:any) => {z.Bed = z.Bed?.sort((a:any, b:any) =>
        (b.occupied?.dateCreated || 0) - (a.occupied?.dateCreated || 0)
    )
    return z;
  });
      this.be = bed;
      console.log('x',this.be)
    }

  sortedRoom(){
    const room = this.room.sort((a, b) =>
      b.occupied?.dateCreated - a.occupied?.dateCreated
    );
    this.ro = room;
  }

  RemoveRecord(rowID: any) {
    this.firebaseService.delete_room(rowID);
  }

  UnlistRoom(id:any){
    this.firestore.collection('Room').doc(id).update({
      isUnlisted: 'true',
    })
  }

  ListRoom(id:any){
    this.firestore.collection('Room').doc(id).update({
      isUnlisted: 'false',
    })
  }

  generatePDF() {
    const doc = new jsPDF();

    const contentElement = this.content.nativeElement;

    const options = {
    width: contentElement.offsetWidth,
    height: contentElement.offsetHeight,
    style: {
      margin: '20px' // Adjust the margin value as per your requirement
    }
  };

    domtoimage.toPng(contentElement,options).then((dataUrl) => {
      const imgWidth = doc.internal.pageSize.getWidth() - 40;
      const imgHeight = (contentElement.offsetHeight / contentElement.offsetWidth) * imgWidth;

      doc.addImage(dataUrl, 'PNG', 20, 20, imgWidth, imgHeight);
      doc.save('Records.pdf');
    });
  }

  exportToCSV(){

    const csvContent = this.convertToCSV(this.room);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'data_export.csv');
  }

  convertToCSV(room: any[]): string {
    const headers = ['Tenant Name', 'Room/Bedspace Placement', 'Payment Status', 'Date of Payment'];
    const rows = [];

    for (const data of room) {
      let i = 0;
      for(const b of data.Bed){
      if (b.occupied) {
        for(const tenant of data.tenantData){
          if(b.occupied?.userId === tenant.id){
            this.tenantName = `${tenant.FName} ${tenant.LName}`
          }
        }

        const rowData = [
          this.tenantName || '',
          `Room${i + 1} / Bed${b.id} ${b.status}`,
          b.occupied?.status === 'paidPayment' ? `Paid in Full / ${data.Price}` : `Pending / ${data.Price}`,
          new Date(b.occupied?.dateCreated).toLocaleString('en-US', { dateStyle: 'short' })
        ];

        rows.push(rowData);
      }
    }
      i++;
    }
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
  }

  async gotoModal1() {
    this.firestore
      .collection('Room')
      .add({
        ownerId: this.ownerUid,
      })
      .then(async (res) => {
        this.uid = res.id;
        const modalInstance = await this.m.create({
          component: Modal1Component,
          backdropDismiss: false,
          componentProps: {
            uid: this.uid,
          },
        });
        this.isModalOpen = true;
        return await modalInstance.present();
      });
  }

  async gotoModal() {
    const modalInstance = await this.m.create({
      component: CreateModalComponent,
      backdropDismiss: false,
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

  LogOut(){
  }

toggleSortOrder() {
  this.isSortAscending = !this.isSortAscending;
  this.sortData();
}

sortData() {
  if(this.sortBy === 'name'){
  this.room.map((data: any) => {
    data.tenantData = data.tenantData?.sort((a: any, b: any) => {
      const nameA = a.FName + ' ' + a.LName;
      const nameB = b.FName + ' ' + b.LName;
      console.log(nameA)
      console.log(nameB)
      console.log(nameA.localeCompare(nameB))
      console.log(nameB.localeCompare(nameA))
      return this.isSortAscending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return data;
  })
}
else{
  this.room.map((z: any) => {
    z.Bed = z.Bed?.sort((a: any, b: any) => {
      const dateA = a.occupied?.dateCreated || 0;
      const dateB = b.occupied?.dateCreated || 0;
      return this.isSortAscending ? dateA - dateB : dateB - dateA;
    })
    return z;
  })
}
  }

  filterData(data: any, b: any):boolean {
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
