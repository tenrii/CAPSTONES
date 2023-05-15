import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal7Component } from '../modal7/modal7.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Modal5Component } from '../modal5/modal5.component';
@Component({
  selector: 'app-modal6',
  templateUrl: './modal6.component.html',
  styleUrls: ['./modal6.component.scss'],
})
export class Modal6Component implements OnInit {
  isButtonDisabled = false;
  constructor(
    private service: FirebaseService,
    private m: ModalController) {}

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

      component: Modal5Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal7() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.m.create({
      component: Modal7Component,
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
