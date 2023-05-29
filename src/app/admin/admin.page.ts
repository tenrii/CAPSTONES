import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
  approveRoomList: any = new BehaviorSubject([]);
  rejectRoomList: any = new BehaviorSubject([]);
  approveOwnerList: any = new BehaviorSubject([]);
  rejectOwnerList: any = new BehaviorSubject([]);

  constructor(
    private firebaseService: FirebaseService,
    private firestore: AngularFirestore
  ) {this.ownerData = {} as OwnerData}

  ngOnInit() {

    this.firebaseService.read_owner().subscribe((data) => {
      this.ownerList = data;
      this.filterOwnerApprove();
      this.filterOwnerReject();
    });


    this.firebaseService.read_room().subscribe((data) => {
      this.roomList = data;
      this.filterRoomApprove();
      this.filterRoomReject();
    });

  }


  filterOwnerApprove(){
    const filtering = this.ownerList.filter((a)=>{
      return a.Permitted === true || a.Permitted === 'true'
    })
    this.approveOwnerList.next(filtering);
  }

  filterRoomApprove(){
    const filtering = this.roomList.filter((a)=>{
      return a.Permitted === true || a.Permitted === 'true'
    })
    this.approveRoomList.next(filtering);
  }


  filterOwnerReject(){
    const filtering = this.ownerList.filter((a)=>{
      return a.Permitted === false || a.Permitted === 'false'
    })
    this.rejectOwnerList.next(filtering);
  }

  filterRoomReject(){
    const filtering = this.roomList.filter((a)=>{
      return a.Permitted === false || a.Permitted === 'false'
    })
    this.rejectRoomList.next(filtering);
  }

  ApproveOwner(a: any) {
    this.firestore.collection('Owner').doc(a).update({ Permitted: true });
  }

  RejectOwner(a: any) {
    this.firestore.collection('Owner').doc(a).update({ Permitted: false });
  }

  ApproveRoom(a: any) {
    this.firestore.collection('Room').doc(a).update({ Permitted: true });
  }

  RejectRoom(a: any) {
    this.firestore.collection('Room').doc(a).update({ Permitted: false });
  }
}
