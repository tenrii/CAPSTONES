import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal2Component } from '../modal2/modal2.component';

@Component({
  selector: 'app-modal1',
  templateUrl: './modal1.component.html',
  styleUrls: ['./modal1.component.scss'],
})
export class Modal1Component implements OnInit {
  isButtonDisabled = false;
  constructor(private m: ModalController) {}

  ngOnInit() {}

  exit() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    this.m.dismiss();
  }

  async gotoModal2() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.m.create({
      component: Modal2Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
