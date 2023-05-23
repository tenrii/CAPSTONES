import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LogComponent } from 'src/app/home/log/log.component';
import { EditOwnerProfileComponent } from 'src/app/owner-panel/edit-owner-profile/edit-owner-profile.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AuthenticationService } from 'src/app/shared/authentication-service';
import { EditProfileComponent } from 'src/app/tenant-panel/edit-profile/edit-profile.component';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
})
export class SiteHeaderComponent implements OnInit {
  tenantUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public tenant: any;
  ownerUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public owner: any;
  user: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  isModalOpen: boolean = false;
  isButtonDisabled: boolean = false;


  constructor(
    private firebaseService: FirebaseService,
    public authService: AuthenticationService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.getTenant();
    this.getOwner();
  }

  isLogin(){
    if(this.user){
      return true;
    }
    else{
      return false;
    }
  }

  filterTenant() {
    if (this.firebaseService.tenantUid.includes(this.user)) {
      return true;
    } else {
      return false;
    }
  }

  filterOwner() {
    if (this.firebaseService.ownerUid.includes(this.user)) {
      return true;
    } else {
      return false;
    }
  }

  async gotoLogModalL() {
    const modalInstance = await this.modalController.create({
      component: LogComponent,
      backdropDismiss: false,
      cssClass: 'login-modal',
      componentProps: {
        button: 'login',
      }
    });
    return await modalInstance.present();
  }

  async gotoLogModalR() {
    const modalInstance = await this.modalController.create({
      component: LogComponent,
      backdropDismiss: false,
      cssClass: 'login-modal',
      componentProps: {
        button: 'register',
      }
    });
    return await modalInstance.present();
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalController.dismiss();
  }

  async getTenant() {
    this.firebaseService.read_tenant().subscribe(() => {
      this.tenant = this.firebaseService.getTenant(this.tenantUid);
    });
  }

  async gotoEditProfile() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.modalController.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.modalController.create({
      component: EditProfileComponent,
      cssClass: 'create-modal',
      componentProps: {
        data: this.tenant,
      },
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 1 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }

  //

  async getOwner(){
    this.firebaseService.read_owner().subscribe(() => {
      this.owner = this.firebaseService.getOwner(this.ownerUid);
    });
  }

  async gotoEditOwnerProfile() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.modalController.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.modalController.create({
      component: EditOwnerProfileComponent,
      cssClass: 'create-modal',
      componentProps: {
        data: this.owner,
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
