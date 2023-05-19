import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal5Component } from '../modal5/modal5.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Modal3Component } from '../modal3/modal3.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { debounceTime } from 'rxjs';

declare var google:any;

interface Marker {
  position: {
    lat: number,
    lng: number,
  };
  title: string;
}
@Component({
  selector: 'app-modal4',
  templateUrl: './modal4.component.html',
  styleUrls: ['./modal4.component.scss'],
})
export class Modal4Component implements OnInit {
  isButtonDisabled = false;
  roomForm!: FormGroup;
  searchAddress:any;
  map:any;
  markers: Marker[] = [];
  mark:any = {};
  constructor(
    private service: FirebaseService,
    private m: ModalController,
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      Street: ['', [Validators.required]],
      Barangay: ['', [Validators.required]],
      City: ['', [Validators.required]],
      Province: ['', [Validators.required]],
      ZIP: ['', [Validators.required]],
    });
    this.loadMap();

    const barangayControl: FormControl = this.roomForm.get('Barangay') as FormControl;
    const cityControl: FormControl = this.roomForm.get('City') as FormControl;
    const provinceControl: FormControl = this.roomForm.get('Province') as FormControl;

    barangayControl.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.searchLocation();
    });

    cityControl.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.searchLocation();
    });

    provinceControl.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.searchLocation();
    });
  }

  exit() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    this.m.dismiss();
  }

////MAP////
  loadMap() {
    // create a new map by passing HTMLElement
    const mapEle: any = document.getElementById('map');
    // create LatLng object
    const myLatLng = {lat: 15.727461, lng: 120.902802};
    // create map
    this.map = new google.maps.Map(mapEle, {
      center: myLatLng,
      zoom: 19
    });

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.renderMarkers();
      mapEle.classList.add('show-map');
    });

    google.maps.event.addListener(this.map, 'click', (event: any) => {
      this.markLocation(event);
    });
  }

  renderMarkers() {
    this.markers.forEach(marker => {
      this.addMarker(marker);
    });
  }

  addMarker(marker: Marker) {
    this.mark = marker.position
    return new google.maps.Marker({
      position: marker.position,
      map: this.map,
      title: marker.title
    });
  }

markLocation(event: any) {
  let marker = google.maps.event.Marker

    if (marker) {
      marker.setMap(null);
    }

    const newMarker: Marker = {
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
      title: `Lat: ${event.latLng.lat().toFixed(6)}, Lng: ${event.latLng.lng().toFixed(6)}`,
    };

    // Add the new marker
    marker = this.addMarker(newMarker);
  }


  searchLocation() {
    const barangayControl: FormControl = this.roomForm.get('Barangay') as FormControl;
    const cityControl: FormControl = this.roomForm.get('City') as FormControl;
    const provinceControl: FormControl = this.roomForm.get('Province') as FormControl;

    const barangay: string = barangayControl.value;
    const city: string = cityControl.value;
    const province: string = provinceControl.value;

    const fullAddress: string = `${barangay}, ${city}, ${province}`;

    if (fullAddress) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
        if (status === 'OK') {
          const location = results[0].geometry.location;
          this.map.setCenter(location);
          this.map.setZoom(19);
          this.markLocation({ latLng: location });
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  }

////MAP////

///

  async back() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.m.create({

      component: Modal3Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 3 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal5() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.m.create({
      component: Modal5Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      this.service.modalData = {
        ...this.service.modalData,
        Street: this.roomForm.get('Street')?.value,
        Barangay: this.roomForm.get('Barangay')?.value,
        City: this.roomForm.get('City')?.value,
        Province: this.roomForm.get('Province')?.value,
        ZIP: this.roomForm.get('ZIP')?.value,
        Marker: this.mark,
      }
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
