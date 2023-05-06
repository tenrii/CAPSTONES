import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal3Component } from '../modal3/modal3.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal2',
  templateUrl: './modal2.component.html',
  styleUrls: ['./modal2.component.scss'],
})
export class Modal2Component implements OnInit {
  isModalOpen = false;
  roomForm!: FormGroup;
  public uid: any;

  constructor(
    private m: ModalController,
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      Rent: ['', [Validators.required]],
    });
  }

  back() {
    this.m.dismiss();
  }

  async gotoModal3() {
    this.firestore.collection('Room').doc(this.uid).update(this.roomForm.value);
    const modalInstance = await this.m.create({
      component: Modal3Component,
      componentProps: {
        uid: this.uid,
      },
      backdropDismiss: false,
    });
    modalInstance.present();
  }
}
