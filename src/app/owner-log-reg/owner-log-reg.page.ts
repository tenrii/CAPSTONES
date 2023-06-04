import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthenticationService } from '../shared/authentication-service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { VerifyOwnerComponent } from './verify-owner/verify-owner.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, finalize, lastValueFrom } from 'rxjs';
import { PasswordResetPage } from '../password-reset/password-reset.page';

@Component({
  selector: 'app-owner-log-reg',
  templateUrl: './owner-log-reg.page.html',
  styleUrls: ['./owner-log-reg.page.scss'],
})
export class OwnerLogRegPage implements OnInit {
  public condition = new BehaviorSubject('login');
  isButtonDisabled = false;
  ownerRegister!: FormGroup;
  isModalOpen = false;
  selectedBP!: File;
  selectedVI!: File;
  downloadURL!: Observable<string>;
  uid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];

  constructor(
    private m: ModalController,
    public authService: AuthenticationService,
    public router: Router,
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
    private alert: AlertController
  ) {}

  ngOnInit() {
    this.ownerRegister = this.fb.group({
      FName: ['', [Validators.required]],
      LName: ['', [Validators.required]],
      Age: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      Address: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.email]],
      check1: [false, Validators.requiredTrue],
      check2: [false, Validators.requiredTrue],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });

    // removed because it is causing call stack exceeded error
    // this.conditionForm.valueChanges.subscribe(() => {
    //   this.conditionForm.updateValueAndValidity();
    // });

    this.route.queryParams.subscribe((params) => {
      const conditions = params['conditions'];
      if (conditions) {
        this.condition.next(conditions);
      }
    });
  }

  businessPermitImage(event: any) {
    this.selectedBP = event.target.files[0];
  }

  validIdImage(event: any) {
    this.selectedVI = event.target.files[0];
  }

  onUpload() {
    // Set the storage path for the image
  }

  logIn(email: any, password: any) {
    this.authService
      .SignIn(email.value, password.value)
      .then(async (res) => {
        if (this.authService.isEmailVerified) {
          const ownerData: any = (await lastValueFrom(this.firestore
            .collection('Owner')
            .doc(res.user!.uid)
            .get())).data();

          if (!ownerData.Permitted || ownerData.Permitted === 'false') {
            let message = 'Your account has been rejected.';
            if (!ownerData.Permitted) {
              message = 'Account pending approval.';
            }
            const alert = await this.alert.create({
              header: 'Sign in failed',
              message,
              buttons: ['OK'],
            });
            await alert.present();
            await alert.onDidDismiss();
            this.authService.SignOut(false);
            return;
          }

          this.router.navigate(['owner-panel']).then(() => {
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
    if (!this.selectedBP || !this.selectedVI) {
      return;
    }
    if (this.isButtonDisabled) {
      return;
    }
    const a = this.authService
      .RegisterUserOwner(
        email.value,
        password.value,
        this.ownerRegister.value,
        this.selectedVI,
        this.selectedBP,
        )
        this.verify()
    .then((res) => {
    });
    this.isButtonDisabled = true;
    return a;
  }

  async verify() {
    const modalInstance = await this.m.create({
      component: VerifyOwnerComponent,
      componentProps: {
        form: this.ownerRegister,
      },
      backdropDismiss: false,
      cssClass: 'verify-modal',
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
