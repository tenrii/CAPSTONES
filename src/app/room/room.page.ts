import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../shared/authentication-service';
import 'firebase/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, combineLatest, finalize, map, tap } from 'rxjs';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { PaymentService } from '../services/payment.service';
import { ModalController } from '@ionic/angular';
import { ChatModalComponent } from './chat-modal/chat-modal.component';
import { GalleryItem, ImageItem } from 'ng-gallery';

declare var google: any;

interface Marker {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
}

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
  map: any;
  markers: Marker[] = [];
  private currentMarker: any = google.maps.event.Marker;
  mark: any = {};
  selectedFiles: any = FileList;
  public data: any;
  public owner: any;
  public review: any[] = [];
  tenant: any = {};
  studentList: any;
  reviewForm: any = FormGroup;
  roomId: any;
  allData: any = {};
  collectionRoom = 'Room';
  downloadURL!: Observable<string>;
  user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  tenantId = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  email = JSON.parse(localStorage.getItem('user') || '{}')['email'];
  isReserving = new BehaviorSubject(false);
  public pendingPayment: any;
  a = 'hello';
  public galleryItems$ = new BehaviorSubject<any>([]);

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
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.reviewForm = this.fb.group({
      Rating: this.star,
      Review: ['', [Validators.required]],
    });

    this.load();
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

    this.firebaseService.read_review(this.roomId).subscribe((data) => {
      this.review = data;
      console.log('review', this.review);
    });

    // console.log('id', this.firebaseService.getRoom(this.roomId));

    this.data = this.firebaseService.getRoom(this.roomId);

    console.log(this.data);
    this.galleryItems$.next([
      ...this.data?.Images?.map(
        (img: string) => new ImageItem({ src: img, thumb: img })
      ),
    ]);

    this.loadMap();
    this.firebaseService.read_owner().subscribe(() => {
      this.owner = this.firebaseService.getOwner(this.data.OwnerId);
    });

    this.data.priceSub = parseFloat(this.data.Price)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,');
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
      this.pendingPayment = this.data.Bed.find(
        (bed: any) =>
          bed?.occupied?.email === this.email &&
          bed?.occupied?.status === 'pendingPayment'
      );
    } else {
      this.pendingPayment =
        this.data.occupied &&
        this.data.occupied.email === this.email &&
        this.data.occupied.status === 'pendingPayment' &&
        this.data;
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
    let paymentRequestType: 'bedspace-reservation' | 'room-reservation' =
      'bedspace-reservation';

    if (this.data.RoomType === 'Shared Room') {
      lineItems = this.data?.Bed.filter((b: any) => b.selected).map(
        (b: any) => {
          return {
            uid: b.uid,
            name: `Bed${b.id} (${b.status})`,
            amount: this.data?.Price,
          };
        }
      );
      paymentRequestType = 'bedspace-reservation';
    } else if (this.data.RoomType === 'Private Room') {
      lineItems = [
        {
          name: this.data.Title,
          amount: this.data?.Price,
        },
      ];
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

  async contactOwner() {
    const chatWithOwnerModal = await this.modalController.create({
      component: ChatModalComponent,
      cssClass: 'normal-modal',
      componentProps: {
        room: this.data,
      },
    });
    await chatWithOwnerModal.present();
    const res = await chatWithOwnerModal.onWillDismiss();
    // TODO remove this redirection. just added for testing.
    // TODO Should not redirect as it is expected that the owner will not respond immediately
    //this.router.navigate(['/', 'chatroom', res.data]);
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
      .doc(this.tenantId)
      .set(this.reviewForm.value)
      .then(() => {
        this.firebaseService.read_tenant().subscribe(() => {
          const tenantData: any = this.firebaseService.getTenant(this.tenantId);
          this.firestore
            .collection('Room')
            .doc(this.roomId)
            .collection('Review')
            .doc(this.tenantId)
            .update({
              Name: tenantData?.FName + ' ' + tenantData?.LName,
              profpic: tenantData?.profpic,
            });
        });
      });
    /*.then((docRef: any) => {
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
      });*/
  }

  filterTenant() {
    if (this.firebaseService.tenantUid.includes(this.user)) {
      return true;
    } else {
      return false;
    }
  }

  async loadMap() {
    const mapEle: any = document.getElementById('map');
    if (this.data?.Marker) {
      const myLatLng = this.data?.Marker; // Example coordinates for San Francisco
      this.map = new google.maps.Map(mapEle, {
        center: myLatLng,
        zoom: 20,
      });

      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        const marker = { position: myLatLng, title: 'My Location' };
        this.addMarker(marker);
        mapEle.classList.add('show-map');
      });
    }
  }

  renderMarkers() {
    // No changes needed if you're marking a single location
  }

  addMarker(marker: Marker) {
    this.mark = marker.position;
    return new google.maps.Marker({
      position: marker.position,
      map: this.map,
      title: marker.title,
    });
  }
}
