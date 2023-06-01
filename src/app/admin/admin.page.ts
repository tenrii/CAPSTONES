import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../shared/authentication-service';

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
  ) {this.ownerData = {} as OwnerData}

  ngOnInit() {

    this.firebaseService.read_owner().subscribe((data) => {
      this.ownerList = data;
      this.filterOwnerPending();
      this.filterOwnerApprove();
      this.filterOwnerReject();
      console.log('a',this.pendingOwnerList.getValue())
      console.log('b',this.approveOwnerList.getValue())
      console.log('c',this.rejectOwnerList.getValue())
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

  filterOwnerPending(){
    const filtering = this.ownerList.filter((a)=>{
      return !a.Permitted
    })
    this.pendingOwnerList.next(filtering);
  }

  filterRoomPending(){
    const filtering = this.roomList.filter((a)=>{
      return !a.Permitted
    })
    this.pendingRoomList.next(filtering);
  }

  filterOwnerApprove(){
    const filtering = this.ownerList.filter((a)=>{
      return a.Permitted === "true"
    })
    this.approveOwnerList.next(filtering);
  }

  filterRoomApprove(){
    const filtering = this.roomList.filter((a)=>{
      return a.Permitted === "true"
    })
    this.approveRoomList.next(filtering);
  }

  filterOwnerReject(){
    const filtering = this.ownerList.filter((a)=>{
      return a.Permitted === "false"
    })
    this.rejectOwnerList.next(filtering);
  }

  filterRoomReject(){
    const filtering = this.roomList.filter((a)=>{
      return a.Permitted === "false"
    })
    this.rejectRoomList.next(filtering);
  }

  ApproveOwner(a: any) {
    this.firestore.collection('Owner').doc(a).update({ Permitted: "true" });
  }

  RejectOwner(a: any) {
    this.firestore.collection('Owner').doc(a).update({ Permitted: "false" });
  }

  ApproveRoom(a: any) {
    this.firestore.collection('Room').doc(a).update({ Permitted: "true" });
  }

  RejectRoom(a: any) {
    this.firestore.collection('Room').doc(a).update({ Permitted: "false" });
  }

}
