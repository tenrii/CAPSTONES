import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal8Component } from '../modal8/modal8.component';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Modal6Component } from '../modal6/modal6.component';

@Component({
  selector: 'app-modal7',
  templateUrl: './modal7.component.html',
  styleUrls: ['./modal7.component.scss'],
})
export class Modal7Component implements OnInit {
  isButtonDisabled = false;
  roomForm!: FormGroup;
  amenities: any[] = [];
  constructor(
    private service: FirebaseService,
    private m: ModalController,
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      Amenities: [[], Validators.required],
    });
  }

  onChange(event: any) {
    if (event.target.checked) {
      const am = this.amenities.findIndex((a: any) => a === event.target.value);
      if (am == -1) {
        this.amenities.push(event.target.value);
      }
    } else {
      const am = this.amenities.findIndex((a: any) => a === event.target.value);
      if (am >= 0) {
        this.amenities.splice(am, 1);
      }
    }
    this.roomForm.get('Amenities')?.setValue(this.amenities);
    console.log('a', this.amenities);
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

      component: Modal6Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal8() {
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
      this.service.modalData = {
        ...this.service.modalData,
        Amenities: this.roomForm.get('Amenities')?.value,
      }
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
