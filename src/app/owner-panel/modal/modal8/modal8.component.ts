import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Modal9Component } from '../modal9/modal9.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Modal7Component } from '../modal7/modal7.component';

@Component({
  selector: 'app-modal8',
  templateUrl: './modal8.component.html',
  styleUrls: ['./modal8.component.scss'],
})
export class Modal8Component implements OnInit {
  uid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  isButtonDisabled = false;
  selectedFiles: any = FileList;
  images: { name: any; url: any }[] = [];;
  img: any[]=[];


  constructor(
    private service: FirebaseService,
    private m: ModalController,
    private storage: AngularFireStorage,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles.item(i);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.images.push({ name: file.name, url: reader.result?.toString() });
      };
    }
  }

  uploadImages() {}

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

      component: Modal7Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  async gotoModal9() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.m.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles.item(i);
      const path = `${this.uid}/Room/${Date.now()}_${file.name}`;
      const uploadTask = this.storage.upload(path, file);
      const ref = this.storage.ref(path);
      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(() => {
            const downloadURL = ref.getDownloadURL();
            downloadURL.subscribe((url: any) => {
              this.img.push(url);
              console.log('Image uploaded successfully:', url);
              console.log(this.img);
            });
          })
        )
        .subscribe();
    }
    const modalInstance = await this.m.create({
      component: Modal9Component,
      cssClass: 'create-modal',
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      this.service.modalData = {
        ...this.service.modalData,
        Images: this.img,
      }
      console.log('Modal 2 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
