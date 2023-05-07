import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../shared/authentication-service';
import 'firebase/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { PaymentService } from '../services/payment.service';

interface Seat {
  id: number;
  status: string;
  uid: string;
  selected?: boolean;
  occupied?: any;
}

@Component({
  selector: 'app-room',
  templateUrl: 'room.page.html',
  styleUrls: ['room.page.scss'],
})
export class RoomPage implements OnInit {
  selectedFiles: any = FileList;
  public data: any;
  public owner: any;
  studentList: any;
  reviewForm!: FormGroup;
  roomId: any;
  collectionRoom = 'Room';
  downloadURL!: Observable<string>;
  email = JSON.parse(localStorage.getItem('user') || '{}')['email'];
  isReserving = new BehaviorSubject(false);
  public pendingPayment: any;

  a = 'hello';

  seats: Seat[] = [];

  public star: number = 0;

  constructor(
    private storage: AngularFireStorage,
    private fb: FormBuilder,
    public authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private firestore: AngularFirestore,
    private paymentService: PaymentService,
  ) {}

  ngOnInit() {
    this.reviewForm = this.fb.group({
      Rating: this.star,
      Review: ['', [Validators.required]],
    });

    this.load();
    if (!this.firebaseService.loading) {
      this.firebaseService.read_owner().subscribe(() => {
        this.owner = this.firebaseService.getOwner(this.data.OwnerId);
      });
      return;
    }
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  async load() {
    if (!this.firebaseService.loading) {
      const roomSub = this.firebaseService.read_room().subscribe(() => {
        this.load();
        roomSub.unsubscribe();
      });
      return;
    }

    this.roomId =
      this.route.snapshot.paramMap.get('id') ||
      window.location.pathname.split('/')[2];

    console.log('id', this.firebaseService.getRoom(this.roomId));

    this.data = this.firebaseService.getRoom(this.roomId);
    this.data.priceSub = parseFloat(this.data.Price).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    this.seats = [];

    // if (!this.data['BedSpaces']) {
    //   for (let i = 1; i <= this.data['NumBedSpace']; i++) {
    //     this.seats.push({ BedSpace: 'B' + i, Occupied: false , Occupant: ''});
    //   }
    // } else {
    //   const a = JSON.parse(this.data['BedSpaces']);
    //   this.seats.push(...[...a]);
    // }
    // console.log('c', this.email);

    // check if user has pending payment
    if (this.data.RoomType === 'Shared Room') {
      this.pendingPayment = this.data.Bed.find((bed: any) => bed?.occupied?.email === this.email && bed?.occupied?.status === 'pendingPayment');
    } else {
      this.pendingPayment = this.data.occupied && this.data.occupied.email === this.email && this.data.occupied.status === 'pendingPayment' && this.data;
    }
    console.log('pending', this.pendingPayment);
  }

  toggleSeat(seat: Seat) {
    if (!seat.selected) {
      seat.selected = true;
    } else {
      seat.selected = false;
    }
  }

  async reserveBedspace() {
    this.isReserving.next(true);

    let lineItems: any[] = [];
    let paymentRequestType: 'bedspace-reservation' | 'room-reservation' = 'bedspace-reservation';

    if (this.data.RoomType === 'Shared Room') {
      lineItems = this.data?.Bed
        .filter((b: any) => b.selected)
        .map((b: any) => {
          return {
            uid: b.uid,
            name: `Bed${b.id} (${b.status})`,
            amount: this.data?.Price,
          }
        });
      paymentRequestType = 'bedspace-reservation';
    } else if (this.data.RoomType === 'Private Room') {
      lineItems = [{
        name: this.data.Title,
        amount: this.data?.Price,
      }];
      paymentRequestType = 'room-reservation';
    }

    if (lineItems.length === 0) {
      this.isReserving.next(false);
      return;
    }

    const response = await this.paymentService.createPaymentSession(
      this.roomId,
      paymentRequestType,
      lineItems
    );
    console.log('res', response);
    window.location.replace(response.checkoutUrl);
  }

  async Rate(i: any) {
    this.star = i;
    this.reviewForm.get('Rating')?.setValue(i);
    console.log('i', i);
  }

  addReview() {
    this.firestore
      .collection('Room')
      .doc(this.roomId)
      .collection('Review')
      .doc(this.owner.id)
      .set(this.reviewForm.value)
      .then((docRef: any) => {
        const filePath = `Room/${this.roomId}/${this.selectedFiles.name}`;
        const fileRef = this.storage.ref(filePath);
        const bp = this.storage.upload(filePath, this.selectedFiles);
        bp.snapshotChanges()
          .pipe(
            finalize(() => {
              this.downloadURL = fileRef.getDownloadURL();
              this.downloadURL.subscribe((url) => {
                this.firestore
                  .collection('Room')
                  .doc(this.roomId)
                  .collection('Review')
                  .doc(this.owner.id)
                  .update({
                    Images: url,
                  });
              });
            })
          )
          .subscribe();
      });
  }
}
