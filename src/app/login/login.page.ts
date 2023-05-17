import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { VerifyComponent } from './verify/verify.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  tenantRegister!: FormGroup;
  isModalOpen = false;

  constructor(
    private m: ModalController,
    public authService: AuthenticationService,
    public router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.tenantRegister = this.fb.group({
      FName: ['', [Validators.required]],
      LName: ['', [Validators.required]],
      Age: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Email: ['', [Validators.required]],
    });
  }

  logIn(email: any, password: any) {
    this.authService
      .SignIn(email.value, password.value)
      .then((res) => {
        if (this.authService.isEmailVerified) {
          this.router.navigate(['tenant-panel']).then(() => {
            window.location.reload();
          });
        } else {
          window.alert('Email is not verified');
          return false;
        }
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  async register(email: any, password: any) {
    const a = await this.authService
      .RegisterUserTenant(
        email.value,
        password.value,
        this.tenantRegister.value
      )
      .then((res) => {
        this.verify();
      })
      .catch((error) => {
        window.alert(error.message);
      });
    return a;
  }

  async verify() {
    const modalInstance = await this.m.create({
      component: VerifyComponent,
      componentProps: {
        form: this.tenantRegister,
      },
      backdropDismiss: false,
    });
    this.isModalOpen = true;
    return await modalInstance.present();
  }

  logInOwner(email: any, password: any) {
    this.authService
      .SignIn(email.value, password.value)
      .then((res) => {
        if (this.authService.isEmailVerified) {
          this.router.navigate(['home']).then(() => {
            window.location.reload();
          });
        } else {
          window.alert('Email is not verified');
          return false;
        }
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  //switchClick(){
  //  const v = document.querySelector('.img__btn');
  //  const x = document.querySelector('.cont');

  //  v?.addEventListener('click', () => {
  //    x?.classList.toggle('s--signup');
  //  });
  //}
}
