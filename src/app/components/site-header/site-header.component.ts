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
    this.getTenant();
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

  async gotoLogModal() {
    const modalInstance = await this.modalController.create({
      component: LogComponent,
      backdropDismiss: false,
      cssClass: 'login-modal',
    });
    return await modalInstance.present();
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalController.dismiss();
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

  async getTenant() {
    this.firebaseService.read_tenant().subscribe(() => {
      this.tenant = this.firebaseService.getTenant(this.user);
    });
  }

}
