import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder } from '@angular/forms';
import { Modal4Component } from '../modal4/modal4.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Modal6Component } from '../modal6/modal6.component';
interface Bed {
  uid: string;
  id: number;
  status: 'up' | 'down';
}

@Component({
  selector: 'app-modal5',
  templateUrl: './modal5.component.html',
  styleUrls: ['./modal5.component.scss'],
})
export class Modal5Component implements OnInit {
  isButtonDisabled = false;
  beds: Bed[] = [];
  n: number = 15;

  constructor(
    private service: FirebaseService,
    private m: ModalController,
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    console.log('a',this.service.modalData)
  }

  exit() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    this.m.dismiss();
  }

  addBed() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charLength = characters.length;
    for (let i = 0; i < this.n; i++) {
      result += characters.charAt(Math.floor(Math.random() * charLength));
    }

    const newBed: Bed = {
      uid: result,
      id: this.beds.length + 1,
      status: 'down',
    };
    this.beds.push(newBed);
    return result;
  }

  onBedChange(bed: Bed) {
    console.log(`Bed ${bed.id} is now ${bed.status}.`);
  }

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

      component: Modal4Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal6() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }
    const modalInstance = await this.m.create({
      component: Modal6Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      this.service.modalData = {
        ...this.service.modalData,
        Bed: this.beds
      }
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
