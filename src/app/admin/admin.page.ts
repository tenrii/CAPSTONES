import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../shared/authentication-service';
import { AlertController, ToastController } from '@ionic/angular';
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
interface OwnerData{
FName: string;
LName: string;
Age: number;
Address: string;
Phone: string;
BusinessPermit: string;
Accepted: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  exportingToPDF: boolean = false;
  @ViewChild('ownerPDF', { static: false }) ownerPDF!: ElementRef;
  @ViewChild('roomPDF', { static: false }) roomPDF!: ElementRef;
  status = new BehaviorSubject('pending')
  switch = new BehaviorSubject('owner')
  public searchText!: string;
  public searchOption!: string;
  roomList: any[]=[];
  ownerData: OwnerData;
  ownerList: any[]=[];
  pendingRoomList: any = new BehaviorSubject([]);
  approveRoomList: any = new BehaviorSubject([]);
  rejectRoomList: any = new BehaviorSubject([]);
  pendingOwnerList: any = new BehaviorSubject([]);
  approveOwnerList: any = new BehaviorSubject([]);
  rejectOwnerList: any = new BehaviorSubject([]);

  constructor(
    private firebaseService: FirebaseService,
    private firestore: AngularFirestore,
    public authService: AuthenticationService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {this.ownerData = {} as OwnerData}

  ngOnInit() {

    this.firebaseService.read_owner().subscribe((data) => {
      this.ownerList = data;
      this.filterOwnerPending();
      this.filterOwnerApprove();
      this.filterOwnerReject();
    });


    this.firebaseService.read_room().subscribe((data) => {
      this.roomList = data;
      this.filterRoomPending();
      this.filterRoomApprove();
      this.filterRoomReject();
    });

  }

  get totalOwnerPending() {
    const filteredList = this.ownerList.filter(item => !item.Permitted);
    return filteredList.length;
  }
  get totalOwnerApprove() {
    const filteredList = this.ownerList.filter(item => item.Permitted === "true");
    return filteredList.length;
  }
  get totalOwnerReject() {
    const filteredList = this.ownerList.filter(item => item.Permitted === "false");
    return filteredList.length;
  }

  get totalRoomPending() {
    const filteredList = this.roomList.filter(item => !item.Permitted);
    return filteredList.length;
  }
  get totalRoomApprove() {
    const filteredList = this.roomList.filter(item => item.Permitted === "true");
    return filteredList.length;
  }
  get totalRoomReject() {
    const filteredList = this.roomList.filter(item => item.Permitted === "false");
    return filteredList.length;
  }
//
  filterOwnerPending(){
    const filtering = this.ownerList.filter((a)=>{

      if(this.searchOption === 'name'){
        return (
          (!a.Permitted) &&
          ((a.FName.toLowerCase()+' '+a.LName.toLowerCase()).includes(this.searchText.toLowerCase()))
          );
      }
      else if(this.searchOption === 'email'){
        return (
          (!a.Permitted) &&
          (a.Email.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }
      else if(this.searchOption === 'address'){
        return (
          (!a.Permitted) &&
          (a.Address.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }
      else if(!this.searchOption){
        return !a.Permitted
      }

    })
    this.pendingOwnerList.next(filtering);
  }
//

//
  filterRoomPending(){
    const filtering = this.roomList.filter((a)=>{

      if(this.searchOption === 'property'){
        return (
          (!a.Permitted) &&
          (a.Title.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'rent'){
        return (
          (!a.Permitted) &&
          (a.Rent.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'room'){
        return (
          (!a.Permitted) &&
          (a.RoomName.toLowerCase().includes(this.searchText.toLowerCase()) ||
          a.RoomType.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'address'){
        return (
          (!a.Permitted) &&
          ((a.Street.toLowerCase()+' '+a.Barangay.toLowerCase()+' '+a.City.toLowerCase()+' '+a.Province.toLowerCase()+' '+a.ZIP.toLowerCase())
          .includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'amenities'){
        return (
          (!a.Permitted) &&
          a.Amenities.some((amenity:any) => amenity.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(!this.searchOption){
        return !a.Permitted
      }

    })
    this.pendingRoomList.next(filtering);
  }
//

//
  filterOwnerApprove(){
    const filtering = this.ownerList.filter((a)=>{
      if(this.searchOption === 'name'){
        return (
          (a.Permitted === 'true') &&
          ((a.FName.toLowerCase()+' '+a.LName.toLowerCase()).includes(this.searchText.toLowerCase()))
          );
      }
      else if(this.searchOption === 'email'){
        return (
          (a.Permitted === 'true') &&
          (a.Email.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }
      else if(this.searchOption === 'address'){
        return (
          (a.Permitted === 'true') &&
          (a.Address.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }
      else if(!this.searchOption){
        return a.Permitted === 'true'
      }
    })
    this.approveOwnerList.next(filtering);
  }
//

//
  filterRoomApprove(){
    const filtering = this.roomList.filter((a)=>{

      if(this.searchOption === 'property'){
        return (
          (a.Permitted === 'true') &&
          (a.Title.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'rent'){
        return (
          (a.Permitted === 'true') &&
          (a.Rent.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'room'){
        return (
          (a.Permitted === 'true') &&
          (a.RoomName.toLowerCase().includes(this.searchText.toLowerCase()) ||
          a.RoomType.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'address'){
        return (
          (a.Permitted === 'true') &&
          ((a.Street.toLowerCase()+' '+a.Barangay.toLowerCase()+' '+a.City.toLowerCase()+' '+a.Province.toLowerCase()+' '+a.ZIP.toLowerCase())
          .includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'amenities'){
        return (
          (a.Permitted === 'true') &&
          a.Amenities.some((amenity:any) => amenity.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(!this.searchOption){
        return a.Permitted === 'true'
      }

    })
    this.approveRoomList.next(filtering);
  }
//

//
  filterOwnerReject(){
    const filtering = this.ownerList.filter((a)=>{
      if(this.searchOption === 'name'){
        return (
          (a.Permitted === 'false') &&
          ((a.FName.toLowerCase()+' '+a.LName.toLowerCase()).includes(this.searchText.toLowerCase()))
          );
      }
      else if(this.searchOption === 'email'){
        return (
          (a.Permitted === 'false') &&
          (a.Email.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }
      else if(this.searchOption === 'address'){
        return (
          (a.Permitted === 'false') &&
          (a.Address.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }
      else if(!this.searchOption){
        return a.Permitted === 'false'
      }
    })
    this.rejectOwnerList.next(filtering);
  }
//

//
  filterRoomReject(){
    const filtering = this.roomList.filter((a)=>{

      if(this.searchOption === 'property'){
        return (
          (a.Permitted === 'false') &&
          (a.Title.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'rent'){
        return (
          (a.Permitted === 'false') &&
          (a.Rent.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'room'){
        return (
          (a.Permitted === 'false') &&
          (a.RoomName.toLowerCase().includes(this.searchText.toLowerCase()) ||
          a.RoomType.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'address'){
        return (
          (a.Permitted === 'false') &&
          ((a.Street.toLowerCase()+' '+a.Barangay.toLowerCase()+' '+a.City.toLowerCase()+' '+a.Province.toLowerCase()+' '+a.ZIP.toLowerCase())
          .includes(this.searchText.toLowerCase()))
          );
      }

      else if(this.searchOption === 'amenities'){
        return (
          (a.Permitted === 'false') &&
          a.Amenities.some((amenity:any) => amenity.toLowerCase().includes(this.searchText.toLowerCase()))
          );
      }

      else if(!this.searchOption){
        return a.Permitted === 'false'
      }

    })
    this.rejectRoomList.next(filtering);
  }
//

  async ApproveOwner(a: any) {
    this.firestore.collection('Owner').doc(a).update({ Permitted: "true" });
    const toast = await this.toastController.create({
      message: 'Owner Approved',
      duration: 3000,
      color: 'success',
    });
    toast.present();
  }

  async RejectOwner(a: any) {
    const alert = await this.alertController.create({
      header: 'Reject owner with reason',
      inputs: [
        {
          placeholder: 'Reason',
          name: 'reason',
          type: 'textarea'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        }, {
          text: 'Reject',
          handler: async (alertData) => {
            if (alertData.reason.trim().length === 0) {
              const toast = await this.toastController.create({
                message: 'Please input reason',
                duration: 3000,
                color: 'danger',
              });
              toast.present();
              return false;
            } else {
              await this.firestore.collection('Owner').doc(a).update({ Permitted: "false", Reason: alertData.reason });
              const toast = await this.toastController.create({
                message: 'Owner has been rejected.',
                duration: 3000,
                color: 'success',
              });
              toast.present();
              return true;
            }
          }
        }
      ]
    });
    alert.present();
    // this.firestore.collection('Owner').doc(a).update({ Permitted: "false" });
  }

  async ApproveRoom(a: any) {
    this.firestore.collection('Room').doc(a).update({ Permitted: "true" });
    const toast = await this.toastController.create({
      message: 'Room Approved',
      duration: 3000,
      color: 'success',
    });
    toast.present();
  }

  async RejectRoom(a: any) {
    const alert = await this.alertController.create({
      header: 'Reject room with reason',
      inputs: [
        {
          placeholder: 'Reason',
          name: 'reason',
          type: 'textarea'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        }, {
          text: 'Reject',
          handler: async (alertData) => {
            if (alertData.reason.trim().length === 0) {
              const toast = await this.toastController.create({
                message: 'Please input reason',
                duration: 3000,
                color: 'danger',
              });
              toast.present();
              return false;
            } else {
              await this.firestore.collection('Room').doc(a).update({ Permitted: "false", Reason: alertData.reason });
              const toast = await this.toastController.create({
                message: 'Room has been rejected.',
                duration: 3000,
                color: 'success',
              });
              toast.present();
              return true;
            }
          }
        }
      ]
    });
    alert.present();
    // this.firestore.collection('Room').doc(a).update({ Permitted: "false" });
  }
//
  exportToCSV(condition:any) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns a zero-based index
    const currentYear = currentDate.getFullYear();

    if(condition === 'pending'){
    const csvContent = this.convertToCSV(this.pendingOwnerList,condition);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Records'+currentMonth+'_'+currentYear+'.csv');
    }

    else if(condition === 'approve'){
    const csvContent = this.convertToCSV(this.approveOwnerList,condition);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Occupant'+currentMonth+'_'+currentYear+'.csv');
    }

    else if(condition === 'reject'){
    const csvContent = this.convertToCSV(this.rejectOwnerList,condition);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Room'+currentMonth+'_'+currentYear+'.csv');
    }
  }

  exportToCSVR(condition:any) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns a zero-based index
    const currentYear = currentDate.getFullYear();

    if(condition === 'pending'){
    const csvContent = this.convertToCSVR(this.pendingRoomList,condition);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Records'+currentMonth+'_'+currentYear+'.csv');
    }

    else if(condition === 'approve'){
    const csvContent = this.convertToCSVR(this.approveRoomList,condition);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Occupant'+currentMonth+'_'+currentYear+'.csv');
    }

    else if(condition === 'reject'){
    const csvContent = this.convertToCSVR(this.rejectRoomList,condition);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Room'+currentMonth+'_'+currentYear+'.csv');
    }
  }
//
//
  convertToCSV(all: any[], condition:any): any {
    if(condition === 'pending'){
    const headers = [
      'Owner Name',
      'Email',
      'Phone Number',
      'Address',
    ];
    const rows = [];

    for (const data of all) {
          const rowData = [
            data.FName + ' ' + data.LName,
            data.Email,
            data.PhoneNum,
            data.Address,
          ];

          rows.push(rowData);
    }
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
    return csvContent;
  }
  else if(condition === 'approve'){
    const headers = [
      'Owner Name',
      'Email',
      'Phone Number',
      'Address',
    ];
    const rows = [];

    for (const data of all) {
          const rowData = [
            data.FName + ' ' + data.LName,
            data.Email,
            data.PhoneNum,
            data.Address,
          ];
          rows.push(rowData);
    }
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
    return csvContent;
  }
  else if(condition === 'reject'){
    const headers = [
      'Property',
      'Room Type',
      'Rent',
      'Beds',
      'Address',
      'Price',
      'Amenities',
      'Details',
    ];
    const rows = [];

    for (const data of all) {
      const headers = [
        'Owner Name',
        'Email',
        'Phone Number',
        'Address',
      ];
      const rows = [];

      for (const data of all) {
            const rowData = [
              data.FName + ' ' + data.LName,
              data.Email,
              data.PhoneNum,
              data.Address,
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
  }
  convertToCSVR(all: any[], condition:any): any {
    if(condition === 'pending'){
      const headers = [
        'Property',
        'Room Type',
        'Rent',
        'Beds',
        'Address',
        'Price',
        'Amenities',
        'Details',
      ];
      const rows = [];

      for (const data of all) {
        const address = `${data.Street}, ${data.Barangay}, ${data.City}, ${data.Province}, ${data.ZIP}`
        const bed = data.Bed.map((bed:any) =>'B'+bed.id+'-'+bed.status === 'up'
              ? 'TOP BUNK' : 'BOTTOM BUNK').join(', ');
        const amenities = data.Amenities.join(', ');
            const rowData = [
              data.Title,
              data.RoomType,
              data.Rent,
              bed,
              address,
              data.Price,
              amenities,
              data.Details,
            ];

            rows.push(rowData);
    }
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
    return csvContent;
  }
  else if(condition === 'approve'){
    const headers = [
      'Property',
      'Room Type',
      'Rent',
      'Beds',
      'Address',
      'Price',
      'Amenities',
      'Details',
    ];
    const rows = [];

    for (const data of all) {
      const address = `${data.Street}, ${data.Barangay}, ${data.City}, ${data.Province}, ${data.ZIP}`
      const bed = data.Bed.map((bed:any) =>'B'+bed.id+'-'+bed.status === 'up'
            ? 'TOP BUNK' : 'BOTTOM BUNK').join(', ');
      const amenities = data.Amenities.join(', ');
          const rowData = [
            data.Title,
            data.RoomType,
            data.Rent,
            bed,
            address,
            data.Price,
            amenities,
            data.Details,
          ];

          rows.push(rowData);
  }
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
    return csvContent;
  }
  else if(condition === 'reject'){
    const headers = [
      'Property',
      'Room Type',
      'Rent',
      'Beds',
      'Address',
      'Price',
      'Amenities',
      'Details',
    ];
    const rows = [];

    for (const data of all) {
      const address = `${data.Street}, ${data.Barangay}, ${data.City}, ${data.Province}, ${data.ZIP}`
      const bed = data.Bed.map((bed:any) =>'B'+bed.id+'-'+bed.status === 'up'
            ? 'TOP BUNK' : 'BOTTOM BUNK').join(', ');
      const amenities = data.Amenities.join(', ');
          const rowData = [
            data.Title,
            data.RoomType,
            data.Rent,
            bed,
            address,
            data.Price,
            amenities,
            data.Details,
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
//
//
generatePDF(condition:any) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns a zero-based index
  const currentYear = currentDate.getFullYear();
  if(condition === 'pending'){
  const doc = new jsPDF();

  const recordsPDFElement = this.ownerPDF.nativeElement;

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
    doc.save('Pending_Owner_'+currentMonth+'_'+currentYear+'.pdf');
  });
}
else if (condition === 'approve') {
    const doc = new jsPDF();
    const recordsPDFElement = this.ownerPDF.nativeElement;

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
      doc.save('Approved_Owner_'+currentMonth+'_'+currentYear+'.pdf');
    });
  }

  else if (condition === 'reject') {
    const doc = new jsPDF();
    const recordsPDFElement = this.ownerPDF.nativeElement;

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
      doc.save('Rejected_Owner_'+currentMonth+'_'+currentYear+'.pdf');
    });
  }
}

generatePDFR(condition:any) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns a zero-based index
  const currentYear = currentDate.getFullYear();
  if(condition === 'pending'){
  const doc = new jsPDF();

  const recordsPDFElement = this.roomPDF.nativeElement;

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
    doc.save('Pending_Room_'+currentMonth+'_'+currentYear+'.pdf');
  });
}
else if (condition === 'approve') {
  const doc = new jsPDF();
  const recordsPDFElement = this.roomPDF.nativeElement;

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
      doc.save('Approved_Room_'+currentMonth+'_'+currentYear+'.pdf');
    });
  }
  else if (condition === 'reject') {
    const doc = new jsPDF();
    const recordsPDFElement = this.roomPDF.nativeElement;

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
    doc.save('Rejected_Room'+currentMonth+'_'+currentYear+'.pdf');
  });
}
}
//
}
