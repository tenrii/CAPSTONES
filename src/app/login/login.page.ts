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
  user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  tenantRegister!: FormGroup;
  isModalOpen = false;
  isRegister = true;

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
      Gender: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Email: ['', [Validators.required]],
    });
  }

  logIn(email: any, password: any) {
    this.authService
      .SignIn(email.value, password.value)
      .then((res) => {
        window.location.reload();
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

  register(email: any, password: any) {
    const a = this.authService
      .RegisterUserTenant(
        email.value,
        password.value,
        this.tenantRegister.value,
      )
      .then((res) => {
        this.authService.SendVerificationMailT()
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
}
