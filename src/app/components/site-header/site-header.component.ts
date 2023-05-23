import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LogComponent } from 'src/app/home/log/log.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AuthenticationService } from 'src/app/shared/authentication-service';
import { EditProfileComponent } from 'src/app/tenant-panel/edit-profile/edit-profile.component';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
})
export class SiteHeaderComponent implements OnInit {
  user: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  isModalOpen: boolean = false;
  isButtonDisabled: boolean = false;
  public tenant: any;

  constructor(
    private firebaseService: FirebaseService,
    public authService: AuthenticationService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
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

}
