import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { VerifyComponent } from './verify/verify.component';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PasswordResetPage } from '../password-reset/password-reset.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public condition = new BehaviorSubject('login');
  user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  tenantRegister!: FormGroup;
  isModalOpen = false;
  isRegister = true;
  isButtonDisabled = false;
  conditionForm!: FormGroup;
  constructor(
    private m: ModalController,
    public authService: AuthenticationService,
    public router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private afstore: AngularFirestore,
    private alert: AlertController
  ) {}

  ngOnInit() {
    this.tenantRegister = this.fb.group({
      FName: ['', [Validators.required]],
      LName: ['', [Validators.required]],
      Age: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      Gender: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      check1: [false, Validators.requiredTrue],
      check2: [false, Validators.requiredTrue],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });

   // this.conditionForm.valueChanges.subscribe(() => {
     // this.conditionForm.updateValueAndValidity();
   // });

    this.route.queryParams.subscribe(params => {
      const conditions = params['conditions'];
      if (conditions) {
        this.condition.next(conditions);
      }
    });
  }

  logIn(email: any, password: any) {
    this.authService
      .SignIn(email.value, password.value)
      .then(async (res) => {
        window.location.reload();
        if (this.authService.isEmailVerified) {
          this.router.navigate(['tenant-panel']).then(() => {
            window.location.reload();
          });
        } else {
          const alert = await this.alert.create({
            header: 'Error',
            message: 'Email is not verified',
            buttons: ['OK'],
          });
          await alert.present();
          return false;
        }
      })
      .catch(async (error) => {
        let message = error.message;
        if (message.toLowerCase().includes('firebase:')) {
          message = message.split('Firebase: ')[1].split(' (')[0];
        }
        const alert = await this.alert.create({
          header: 'Error',
          message,
          buttons: ['OK'],
        });
        await alert.present();
      });
  }

  register(email: any, password: any) {
    if (this.isButtonDisabled) {
      return;
    }
    const a = this.authService
      .RegisterUserTenant(
        email.value,
        password.value,
        this.tenantRegister.value,
      )
        this.verify();
        this.isButtonDisabled = true;
        return a;
  }

  async verify() {
    const modalInstance = await this.m.create({
      component: VerifyComponent,
      componentProps: {
        form: this.tenantRegister,
      },
      backdropDismiss: false,
      cssClass: 'verify-modal'
    });
    this.isModalOpen = true;
    return await modalInstance.present();
  }

  async openResetPassword() {
    const modal = await this.m.create({
      component: PasswordResetPage,
      cssClass: 'password-reset-modal',
      componentProps: {
        openAsModal: true,
      }
    });
    modal.present();
  }

}
