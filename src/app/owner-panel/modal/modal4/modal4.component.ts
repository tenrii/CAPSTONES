import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal5Component } from '../modal5/modal5.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Modal3Component } from '../modal3/modal3.component';
import { FirebaseService } from 'src/app/services/firebase.service';
@Component({
  selector: 'app-modal4',
  templateUrl: './modal4.component.html',
  styleUrls: ['./modal4.component.scss'],
})
export class Modal4Component implements OnInit {
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
      Street: ['', [Validators.required]],
      Barangay: ['', [Validators.required]],
      City: ['', [Validators.required]],
      Province: ['', [Validators.required]],
      ZIP: ['', [Validators.required]],
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

      component: Modal3Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 3 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal5() {
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
      this.service.modalData = {
        ...this.service.modalData,
        Street: this.roomForm.get('Street')?.value,
        Barangay: this.roomForm.get('Barangay')?.value,
        City: this.roomForm.get('City')?.value,
        Province: this.roomForm.get('Province')?.value,
        ZIP: this.roomForm.get('ZIP')?.value,
      }
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
