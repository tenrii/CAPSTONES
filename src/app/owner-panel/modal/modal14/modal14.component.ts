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
  ownerUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public owner: any;
  constructor(
    private service: FirebaseService,
    private m: ModalController,
    private afs: AngularFirestore,
    private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.getOwner();
  }

  async getOwner(){
    this.firebaseService.read_owner().subscribe(() => {
      this.owner = this.firebaseService.getOwner(this.ownerUid);
    });
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

      component: Modal13Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
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
