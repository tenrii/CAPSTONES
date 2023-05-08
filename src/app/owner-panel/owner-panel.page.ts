import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AnimationController, ModalController } from '@ionic/angular';
import { CreateModalComponent } from './create-modal/create-modal.component';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { Modal1Component } from './modal/modal1/modal1.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';

interface RoomData {
  Name: string;
  Price: number;
  Address: string;
  NumBedSpace: number;
  Detail: string;
  Available: number;
}

@Component({
  selector: 'app-owner-panel',
  templateUrl: './owner-panel.page.html',
  styleUrls: ['./owner-panel.page.scss'],
})
export class OwnerPanelPage implements OnInit {
  roomList!: any[];
  roomData!: RoomData;
  roomForm!: FormGroup;
  nbs: any = 1;
  isModalOpen = false;
  uid: any;
  ownerUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public owner: any;

  constructor(
    private animationCtrl: AnimationController,
    private m: ModalController,
    private af: AngularFireStorage,
    private firestore: AngularFirestore,
    private firebaseService: FirebaseService,
    public fb: FormBuilder
  ) {
    this.roomData = {} as RoomData;
  }

  ngOnInit() {
    this.firebaseService.read_room().subscribe((data) => {
      this.roomList = data;
      console.log('stud list', this.roomList);
    });

    if (!this.firebaseService.loading) {
      this.firebaseService.read_owner().subscribe(() => {
        console.log('a',this.ownerUid)
        this.owner = this.firebaseService.getOwner(this.ownerUid);
        console.log('b',this.owner)
      });
      return;
    }
  }

  CreateRecord() {
    if (this.af !== null) {
      this.firebaseService
        .create_room(this.roomForm.value)
        .then((resp) => {
          //Reset form
          this.roomForm.reset();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  RemoveRecord(rowID: any) {
    this.firebaseService.delete_room(rowID);
  }

  async gotoModal1() {
    this.firestore
      .collection('Room')
      .add({
        OwnerId: this.ownerUid,
      })
      .then(async (res) => {
        this.uid = res.id;
        const modalInstance = await this.m.create({
          component: Modal1Component,
          backdropDismiss: false,
          componentProps: {
            uid: this.uid,
          },
        });
        this.isModalOpen = true;
        return await modalInstance.present();
      });
  }

  async gotoModal() {
    const modalInstance = await this.m.create({
      component: CreateModalComponent,
      backdropDismiss: false,
    });
    this.isModalOpen = true;
    return await modalInstance.present();
  }

  async gotoEditModal(record: any) {
    const modalInstance = await this.m.create({
      component: EditModalComponent,
      componentProps: {
        record,
      },
    });
    modalInstance.present();
  }

  closeModal() {
    this.isModalOpen = false;
    this.m.dismiss();
  }
}
