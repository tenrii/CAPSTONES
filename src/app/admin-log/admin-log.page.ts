import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/authentication-service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AdminGuardService } from '../shared/admin-guard.service';

@Component({
  selector: 'app-admin-log',
  templateUrl: './admin-log.page.html',
  styleUrls: ['./admin-log.page.scss'],
})
export class AdminLogPage implements OnInit {
  isAdmin: boolean = false;
  user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private alert: AlertController,
    public adminGuard: AdminGuardService,
  ) {
  }

  ngOnInit() {
    if(this.user === 'SDnrpKCCR2PeoNye2q1Bh44VryF3'){
      this.isAdmin = true;
    }
  }

  logIn(email:any, password:any){
    this.authService
    .SignInAdmin(email.value, password.value)
    .then(async (res) => {
      window.location.reload();
        this.router.navigate(['admin']).then(()=>{
          window.location.reload();
        })
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
}
