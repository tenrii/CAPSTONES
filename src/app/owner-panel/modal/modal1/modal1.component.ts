import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal2Component } from '../modal2/modal2.component';

@Component({
  selector: 'app-modal1',
  templateUrl: './modal1.component.html',
  styleUrls: ['./modal1.component.scss'],
})
export class Modal1Component implements OnInit {
  uid: any;
  constructor(private m: ModalController) {}

  ngOnInit() {}

  back() {
    this.m.dismiss();
  }

  async gotoModal2() {
    const modalInstance = await this.m.create({
      component: Modal2Component,
      backdropDismiss: false,
      componentProps: {
        uid: this.uid,
      },
    });
    modalInstance.present();
  }
}
