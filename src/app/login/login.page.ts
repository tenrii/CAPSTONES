import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { VerifyComponent } from './verify/verify.component';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
  conditionForm!: FormGroup;
  constructor(
    private m: ModalController,
    public authService: AuthenticationService,
    public router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private afstore: AngularFirestore,
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

    this.conditionForm = this.fb.group({
      check1: [false, Validators.requiredTrue],
      check2: [false, Validators.requiredTrue]
    });

    this.conditionForm.valueChanges.subscribe(() => {
      this.conditionForm.updateValueAndValidity();
    });

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
        this.verify();
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
