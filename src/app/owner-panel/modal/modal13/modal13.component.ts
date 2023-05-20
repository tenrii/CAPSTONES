import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal14Component } from '../modal14/modal14.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { Modal12Component } from '../modal12/modal12.component';

@Component({
  selector: 'app-modal13',
  templateUrl: './modal13.component.html',
  styleUrls: ['./modal13.component.scss'],
})
export class Modal13Component implements OnInit {
  public data: any = {};
  roomId: any;
  isButtonDisabled = false;
  constructor(
    private m: ModalController,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.data = this.firebaseService.modalData;
    console.log('a',this.data.value)
    console.log('a',this.firebaseService.modalData)
  }

  exit() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    this.m.dismiss();
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

      component: Modal12Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal14() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.m.create({
      component: Modal14Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      this.firebaseService.modalData = {
        ...this.firebaseService.modalData,
      }

      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
