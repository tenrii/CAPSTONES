import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../shared/authentication-service';
import { AlertController, ToastController } from '@ionic/angular';

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

}
