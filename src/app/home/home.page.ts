import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication-service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

interface RoomData {
  Id: any;
  Name: string;
  Price: number;
  Address: string;
  Rent: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  currentPage: number = 1;
  itemsPerPage: number = 8;
  roomList: any[] = [];
  emailList: any[] = [];
  roomData!: RoomData;
  list: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  listEmail: any = new BehaviorSubject([]);
  filterPlace: any;
  filterRent: any;
  barangay: any;
  rent: any;
  price: any = { lower: 0, upper: 5000 };
  priceMax: any = 0;
  pc: number = 10;
  myIndex: number = 0;
  roomLenght:any;
  slideOpts = {
    initialSlide: 1,
    speed: 400,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
  };

  constructor(
    public authService: AuthenticationService,
    private router: Router,
    private firebaseService: FirebaseService,
    public fb: FormBuilder,
    private afstore: AngularFirestore,
  ) {
    this.roomData = {} as RoomData;
  }

  ngOnInit() {
    this.firebaseService.read_room().subscribe((data) => {
      this.roomList = data;
      this.filterPlace = [...new Set(this.roomList.map((a) => a.Barangay.toLowerCase()))];
      this.filterRent = [...new Set(this.roomList.map((a) => a.Rent))];

      const sorted = this.roomList.sort((a: any, b: any) => {
        const pa = parseInt(a.Price);
        const pb = parseInt(b.Price);
        return pa - pb;
      });
      this.priceMax = sorted[sorted.length - 1].Price;
      this.price.upper = this.priceMax;

      this.filter();
      console.log('a', this.list.getValue());
    });
  }

  getAd(barangay: any) {
    return this.filter();
  }

  getRe(rent: any) {
    return this.filter();
  }

  filterPrice() {
    this.filter();
  }

  filter() {
    const filteredList = this.roomList.filter((obj) => {
      return (
        (!this.barangay|| this.barangay === obj.Barangay.toLowerCase()) &&
        (!this.rent || this.rent === obj.Rent) &&
        this.price.upper >= obj.Price &&
        this.price.lower <= obj.Price
      );
    });
    this.list.next(filteredList);
  }


  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  getTotalPages() {
    const filteredList = this.list.getValue().filter(item => item.Permitted === "true");
    return Math.ceil(filteredList.length / this.itemsPerPage);
  }

  get totalPages() {
    const filteredList = this.list.getValue().filter(item => item.Permitted === "true");
    return Math.ceil(filteredList.length / this.itemsPerPage);
  }


}
