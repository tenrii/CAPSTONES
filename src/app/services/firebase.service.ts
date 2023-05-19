// firebase.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { doc, getDocFromCache, getFirestore } from 'firebase/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export interface User {
  uid: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  collectionRoom = 'Room';
  collectionTenant = 'Tenant';
  collectionOwner = 'Owner';
  public tenantUid: any[] = [];
  public ownerUid: any[] = [];
  rooms: any = new BehaviorSubject([]);
  tenants: any = new BehaviorSubject([]);
  owners: any = new BehaviorSubject([]);
  reviews: any = new BehaviorSubject([]);
  transactions: any = new BehaviorSubject([]);
  public loading: boolean = false;
  currentUser!: User;
  public modalData: any = {};
  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
    this.firestore
      .collection('Tenant')
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach((doc: any) => {
          this.tenantUid.push(doc.id);
        });
      });

    this.firestore
      .collection('Owner')
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach((doc: any) => {
          this.ownerUid.push(doc.id);
        });
      });
  }

  create_room(record: any) {
    console.log(record);

    return this.firestore.collection(this.collectionRoom).add(record);
  }

  create_tenant(record: any) {
    console.log(record);

    return this.firestore.collection(this.collectionTenant).add(record);
  }

  create_owner(record: any) {
    console.log(record);

    return this.firestore.collection(this.collectionOwner).add(record);
  }

  read_room(): Observable<any[]> {
    return this.firestore
      .collection(this.collectionRoom)
      .snapshotChanges()
      .pipe(
        map((a) => {
          this.loading = true;
          const roomList = a.map((e) => {
            const localData: any = e.payload.doc.data();
            return {
              id: e.payload.doc.id,
              isEdit: false,
              OwnerId: localData.ownerId || localData.OwnerId, // TODO @tenrii OwnerId (with capital O) is has " in the string
              Rent: localData.Rent,
              RoomName: localData.RoomName,
              RoomType: localData.RoomType,
              Street: localData.Street,
              Barangay: localData.Barangay,
              City: localData.City,
              Province: localData.Province,
              ZIP: localData.ZIP,
              Bed: localData.Bed,
              Amenities: localData.Amenities,
              Images: localData.Images,
              Title: localData.Title,
              Details: localData.Details,
              Price: localData.Price,
              occupied: localData.occupied,
              isUnlisted: localData.isUnlisted,
            };
          });
          return roomList;
        }),
        tap((a) => {
          this.rooms.next(a);
        })
      );
  }

  read_tenant(): Observable<any[]> {
    return this.firestore
      .collection(this.collectionTenant)
      .snapshotChanges()
      .pipe(
        map((a) => {
          const tenantList = a.map((e) => {
            const localData: any = e.payload.doc.data();
            return {
              id: e.payload.doc.id,
              isEdit: false,
              uid: localData.uid,
              FName: localData.FName,
              LName: localData.LName,
              Age: localData.Age,
              Gender: localData.Gender,
              Address: localData.Address,
              Email: localData.Email,
              profpic: localData.profpic,
            };
          });
          return tenantList;
        }),
        tap((a) => {
          this.tenants.next(a);
        })
      );
  }

  read_owner(): Observable<any[]> {
    return this.firestore
      .collection(this.collectionOwner)
      .snapshotChanges()
      .pipe(
        map((a) => {
          this.loading = true;
          const ownerList = a.map((e) => {
            const localData: any = e.payload.doc.data();
            return {
              id: e.payload.doc.id,
              isEdit: false,
              uid: localData.uid,
              FName: localData.FName,
              LName: localData.LName,
              Age: localData.Age,
              Address: localData.Address,
              Email: localData.Email,
              Accepted: localData.Accepted,
              Phone: localData.Phone,
              BusinessPermit: localData.BusinessPermit,
              profpic: localData.profpic,
            };
          });
          return ownerList;
        }),
        tap((a) => {
          this.owners.next(a);
        })
      );
  }

  read_transaction(): Observable<any[]> {
    return this.firestore
      .collection('ActivePaymentSessions')
      .snapshotChanges()
      .pipe(
        map((a) => {
          this.loading = true;
          const ownerList = a.map((e) => {
            const localData: any = e.payload.doc.data();
            return {
              id: e.payload.doc.id,
              isEdit: false,
              dateCreated: localData.dateCreated,
              lineItems: localData.lineItems,
              roomId: localData.roomId,
              status: localData.status,
              userId: localData.userId,
              type: localData.type,
            };
          });
          return ownerList;
        }),
        tap((a) => {
          this.transactions.next(a);
        })
      );
  }

  read_review(id:any): Observable<any[]> {
    return this.firestore
      .collection('Room').doc(id).collection('Review')
      .snapshotChanges()
      .pipe(
        map((a) => {
          const ownerList = a.map((e) => {
            const localData: any = e.payload.doc.data();
            return {
              id: e.payload.doc.id,
              isEdit: false,
              Name: localData.Name,
              profpic: localData.profpic,
              Rating: localData.Rating,
              Review: localData.Review,
            };
          });
          return ownerList;
        }),
        tap((a) => {
          this.reviews.next(a);
        })
      );
  }

  update_room(recordID: any, record: any) {
    this.firestore.doc(this.collectionRoom + '/' + recordID).update(record);
  }

  update_owner(ownerID: any, record: any) {
    this.firestore.doc(this.collectionOwner + '/' + ownerID).update(record);
  }

  delete_room(record_id: any) {
    this.firestore.doc(this.collectionRoom + '/' + record_id).delete();
  }

  delete_owner(record_id: any) {
    this.firestore.doc(this.collectionOwner + '/' + record_id).delete();
  }

  getRoom(data: any) {
    return this.rooms.value.find((a: any) => a.id == data);
  }

  getOwnerRoom(data: any) {
    return this.rooms.value.find((a: any) => a.ownerId == data);
  }

  getOwner(owner: any) {
    return this.owners.value.find((a: any) => a.id == owner);
  }

  getTenant(tenant: any) {
    return this.tenants.value.find((a: any) => a.id == tenant);
  }

  getTransaction(transaction: any) {
    return this.transactions.value.filter((a: any) => a.userId === transaction);
  }
}
