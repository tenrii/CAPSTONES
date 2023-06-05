import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import moment from 'moment';

import { BehaviorSubject, bindNodeCallback, combineLatest, map } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-bill-record',
  templateUrl: './bill-record.component.html',
  styleUrls: ['./bill-record.component.scss'],
})
export class BillRecordComponent implements OnInit {


  public tenantBill: any [] = [];
  ownerUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  room: any[] = [];
  occupant:any[] = [];
  constructor(
    private firebaseService: FirebaseService,
    private m: ModalController,
    private afstore: AngularFirestore,
  ) { }

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
        this.sortedTenant();
      })
  }

  sortedTenant(){
    this.occupant = [];
    let bills: any[] = [];
    this.room.map((a:any)=>{
      if (a.occupied) {
        const room = a.tenantData.filter((z:any)=>{
          return a.occupied?.userId === z.uid;
        });
        this.afstore.collection('Tenant').doc(room.map((data: any) => data.id).join(', ')).collection('Reservations').valueChanges()
        .pipe(
          map((reservations) => {
            return reservations.filter((x: any) => x.status === 'active' && x.roomId === a.id)
              .map((b: any) => {
                const reservationRoom = reservations.find((z: any) => z.id === a.id);
                b.RoomData = reservationRoom;
                b.lastPaymentMonth = b?.payments?.length > 0 ? b.payments.sort((a: any, b: any) => b.monthDate - a.monthDate)[b.payments.length - 1].monthDate : b.dateCreated;
                b.nextPaymentMonth = moment(b.lastPaymentMonth).add(1, 'month').toDate();
                return b;
              });
          })
        )
        .subscribe((result) => {
            bills = result;
          });
        this.occupant.push({
          FName: room.map((data:any) => data.FName),
          LName: room.map((data:any) => data.LName),
          Title: a.Title,
          RoomName: a.RoomName,
          roomId: a.id,
          userId: a.occupied?.userId,
          paymentStatus: a.occupied?.status,
          lastPaymentMonth: bills.map((data:any)=> data.lastPaymentMonth),
          nextPaymentMonth: bills.map((data:any)=> data.nextPaymentMonth),
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
          paymentStatus: b.occupied?.status,
          lastPaymentMonth: bills.map((data:any)=> data.lastPaymentMonth),
          nextPaymentMonth: bills.map((data:any)=> data.nextPaymentMonth),
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

}
