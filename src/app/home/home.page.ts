import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication-service';

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
  roomList: any[] = [];
  emailList: any[] = [];
  roomData!: RoomData;
  list: any = new BehaviorSubject([]);
  listEmail: any = new BehaviorSubject([]);
  filterPlace: any;
  filterRent: any;
  barangay: any;
  rent: any;
  price: any = { lower: 0, upper: 5000 };
  priceMax: any = 0;
  pc: number = 10;
  myIndex: number = 0;
  slideOpts = {
    initialSlide: 1,
    speed: 400,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
  };
  email = JSON.parse(localStorage.getItem('user') || '{}')['email'];
  emails = JSON.stringify(this.email);

  constructor(
    public authService: AuthenticationService,
    private router: Router,
    private firebaseService: FirebaseService,
    public fb: FormBuilder
  ) {
    this.roomData = {} as RoomData;
  }

  ngOnInit() {
    this.firebaseService.read_room().subscribe((data) => {
      this.roomList = data;

      this.filterPlace = [...new Set(this.roomList.map((a) => a.Barangay))];
      this.filterRent = [...new Set(this.roomList.map((a) => a.Rent))];

      const sorted = this.roomList.sort((a: any, b: any) => {
        const pa = parseInt(a.Price);
        const pb = parseInt(b.Price);
        return pa - pb;
      });
      this.priceMax = sorted.pop().Price;
      this.price.upper = this.priceMax;

      this.filter();
      console.log('a', this.list);
    });

    this.firebaseService.read_owner().subscribe((data) => {
      this.emailList = data;
      this.filterEmail();
      console.log('b', this.listEmail);
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
        (!this.barangay || this.barangay === obj.Barangay) &&
        (!this.rent || this.rent === obj.Rent) &&
        this.price.upper >= obj.Price &&
        this.price.lower <= obj.Price
      );
    });
    this.list.next(filteredList);
  }

  filterEmail() {
    const filteredEList = this.emailList.filter((a) => {
      return this.email === a.Email || this.emails === a.Email;
    });
    this.listEmail.next(filteredEList);
  }
}
