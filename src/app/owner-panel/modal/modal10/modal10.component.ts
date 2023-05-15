import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal11Component } from '../modal11/modal11.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Modal9Component } from '../modal9/modal9.component';

@Component({
  selector: 'app-modal10',
  templateUrl: './modal10.component.html',
  styleUrls: ['./modal10.component.scss'],
})
export class Modal10Component implements OnInit {
  isButtonDisabled = false;
  roomForm!: FormGroup;
  constructor(
    private service: FirebaseService,
    private m: ModalController,
    private fb: FormBuilder,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      Details: ['', [Validators.required]],
    });
    const messageTextarea: any = document.querySelector('#message');
    const messageCounter: any = document.querySelector('#message-counter');

    messageTextarea.addEventListener('input', function () {
      const length = messageTextarea.value.length;
      messageCounter.textContent = length + ' / 250 characters';
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

      component: Modal9Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal11() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }
    const modalInstance = await this.m.create({
      component: Modal11Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      this.service.modalData = {
        ...this.service.modalData,
        Details: this.roomForm.get('Details')?.value,
      }
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
