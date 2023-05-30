import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthenticationService } from '../shared/authentication-service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { VerifyOwnerComponent } from './verify-owner/verify-owner.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, finalize } from 'rxjs';

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
  conditionForm!: FormGroup;
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
      Age: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Email: ['', [Validators.required]],
    });

    this.conditionForm = this.fb.group({
      check1: [false, Validators.requiredTrue],
      check2: [false, Validators.requiredTrue]
    });

    this.conditionForm.valueChanges.subscribe(() => {
      this.conditionForm.updateValueAndValidity();
    });

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
    this.authService
      .RegisterUserOwner(email.value, password.value, this.ownerRegister.value)
      this.verify()
      .then((res) => {
        const filePathBP = `Owner/${this.authService.uid}/${this.selectedBP.name}`;
        const fileRefBP = this.storage.ref(filePathBP);
        const bp = this.storage.upload(filePathBP, this.selectedBP);
        bp.snapshotChanges()
          .pipe(
            finalize(() => {
              this.downloadURL = fileRefBP.getDownloadURL();
              this.downloadURL.subscribe((url) => {
                this.firestore
                  .collection('Owner')
                  .doc(this.authService.uid)
                  .update({
                    BusinessPermit: url,
                  });
              });
            })
          )
          .subscribe();

        const filePathVI = `Owner/${this.authService.uid}/${this.selectedVI.name}`;
        const fileRefVI = this.storage.ref(filePathVI);
        const vi = this.storage.upload(filePathVI, this.selectedVI);
        bp.snapshotChanges()
          .pipe(
            finalize(() => {
              this.downloadURL = fileRefVI.getDownloadURL();
              this.downloadURL.subscribe((url) => {
                this.firestore
                  .collection('Owner')
                  .doc(this.authService.uid)
                  .update({
                    ValidID: url,
                  });
              });
            })
          )
          .subscribe();
      });
  }

  async verify() {
    const modalInstance = await this.m.create({
      component: VerifyOwnerComponent,
      componentProps: {
        form: this.ownerRegister,
      },
      backdropDismiss: false,
    });
    this.isModalOpen = true;
    return await modalInstance.present();
  }

}
