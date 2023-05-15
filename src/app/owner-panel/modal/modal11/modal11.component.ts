import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal12Component } from '../modal12/modal12.component';
import { Modal10Component } from '../modal10/modal10.component';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-modal11',
  templateUrl: './modal11.component.html',
  styleUrls: ['./modal11.component.scss'],
})
export class Modal11Component implements OnInit {
  isButtonDisabled = false;
  constructor(
    private service: FirebaseService,
    private m: ModalController
    ) {}

  ngOnInit() {}

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

      component: Modal10Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal12() {
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
      this.service.modalData = {
        ...this.service.modalData,
      }
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
