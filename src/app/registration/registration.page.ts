import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthenticationService } from "../shared/authentication-service";
@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  ngFireAuth: any;
  constructor(
    public authService: AuthenticationService,
    public router: Router
  ) { }
  ngOnInit(){}
  /*signUpTenant(email: any, password: any ){
    this.authService.RegisterUserTenant(email.value, password.value)
    .then((res) => {
      // Do something here
      this.authService.SendVerificationMail()
      this.router.navigate(['verify-email']);
    }).catch((error) => {
      window.alert(error.message)
    })
}

signUpOwner(email: any, password: any ){
  this.authService.RegisterUserOwner(email.value, password.value)
  .then((res) => {
    // Do something here
    this.authService.SendVerificationMailO()
    this.router.navigate(['verify-email']);
  }).catch((error) => {
    window.alert(error.message)
  })
}*/

SendVerificationMailT() {
  return this.ngFireAuth.auth.currentUser.sendEmailVerification()
  .then(() => {
    this.router.navigate(['verify-email']);
  })
}

SendVerificationMailO() {
  return this.ngFireAuth.auth.currentUser.sendEmailVerification()
  .then(() => {
    this.router.navigate(['verify-email']);
  })
}

}
