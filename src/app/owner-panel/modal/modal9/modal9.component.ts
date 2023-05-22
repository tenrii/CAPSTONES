import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal10Component } from '../modal10/modal10.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Modal8Component } from '../modal8/modal8.component';

@Component({
  selector: 'app-modal9',
  templateUrl: './modal9.component.html',
  styleUrls: ['./modal9.component.scss'],
})
export class Modal9Component implements OnInit {
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
      Title: ['', [Validators.required]],
    });
    const messageTextarea: any = document.querySelector('#message');
    const messageCounter: any = document.querySelector('#message-counter');

    messageTextarea.addEventListener('input', function () {
      const length = messageTextarea.value.length;
      messageCounter.textContent = length + ' / 100 characters';
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
      component: Modal8Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal10() {
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
      this.service.modalData = {
        ...this.service.modalData,
        Title: this.roomForm.get('Title')?.value,
      };
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
