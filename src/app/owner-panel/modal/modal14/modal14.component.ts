import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Modal13Component } from '../modal13/modal13.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-modal14',
  templateUrl: './modal14.component.html',
  styleUrls: ['./modal14.component.scss'],
})
export class Modal14Component implements OnInit {
  isButtonDisabled = false;
  constructor(
    private service: FirebaseService,
    private m: ModalController,
    private afs: AngularFirestore) {}

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

      component: Modal13Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  done() {
    this.afs.collection('Room').add(this.service.modalData).then((resp:any) =>{
      window.location.reload();
    })
  }
}
