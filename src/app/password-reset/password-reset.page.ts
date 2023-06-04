import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/authentication-service';
import { ModalController, ToastController } from '@ionic/angular';
@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit {
  public openAsModal = false;

  constructor(
    private authService: AuthenticationService,
    public modalController: ModalController,
    private toastController: ToastController 
  ) {}

  ngOnInit() {}

  async sendResetRequest(email: any) {
    if (!email?.length) {
      const toast = await this.toastController.create({
        message: 'Please enter your email address.',
        duration: 3000,
        color: 'danger',
      });
      toast.present();
      return;
    }
    try {
      await this.authService.PasswordRecover(email);
      const toast = await this.toastController.create({
        message: 'Password reset email sent, please check your inbox.',
        duration: 3000,
        color: 'success',
      });
      toast.present();
      this.modalController.dismiss();
    } catch (error: any) {
      // console.log(error);
      let message = error.message.toString();
      if (message.toLowerCase().includes('firebase:')) {
        message = message.split('Firebase: ')[1].split(' (')[0];
      }
      const toast = await this.toastController.create({
        message,
        duration: 3000,
        color: 'danger',
      });
      toast.present();
    }
  }
}
