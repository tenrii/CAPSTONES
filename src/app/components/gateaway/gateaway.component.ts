import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { KeyComponent } from './key/key.component';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-gateaway',
  templateUrl: './gateaway.component.html',
  styleUrls: ['./gateaway.component.scss'],
})
export class GateawayComponent implements OnInit {
  isButtonDisabled = false;
  public ownerId:any;
  public data:any;
  isModalOpen = false;
  content:any = new BehaviorSubject('menu');
  constructor(
    private firebaseService: FirebaseService,
    private m: ModalController
  ) { }

  ngOnInit() {
    this.firebaseService.read_tenant().subscribe(() => {
      this.data = this.firebaseService.getOwner(this.ownerId);
      console.log('data',this.data)
    });
  }


  exit() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    this.m.dismiss();
  }

  async update(key:any) {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const modalInstance = await this.m.create({
      component: KeyComponent,
      cssClass: 'key-modal',
      componentProps:{
        ownerId: this.ownerId,
        key: key,
      },
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 1 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
}
