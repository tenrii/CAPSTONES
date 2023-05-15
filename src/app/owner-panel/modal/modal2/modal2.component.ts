import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal3Component } from '../modal3/modal3.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Modal1Component } from '../modal1/modal1.component';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-modal2',
  templateUrl: './modal2.component.html',
  styleUrls: ['./modal2.component.scss'],
})
export class Modal2Component implements OnInit {
  isButtonDisabled = false;
  roomForm!: FormGroup;
  constructor(
    private service: FirebaseService,
    private m: ModalController,
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      Rent: ['', [Validators.required]],
    });
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

      component: Modal1Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal3() {
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
      this.service.modalData = {
        Rent: this.roomForm.get('Rent')?.value,
      }
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
