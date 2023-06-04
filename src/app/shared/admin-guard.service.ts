import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication-service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService } from '../services/firebase.service';
import { AdminPage } from '../admin/admin.page';

@Injectable({
  providedIn: "root"
})

export class AdminGuardService{

  constructor(
    private router: Router,
    public ngFireAuth: AngularFireAuth,
    public authService: AuthenticationService,
    public firebaseService: FirebaseService,
    public firestore: AngularFirestore,
    public admin: AdminPage
  ) {

  }

  async canActivate(route: any, state: any) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
    if (!user && !this.firebaseService.adminUid.includes(user)) {
      this.router.navigate(['/admin-log']);
      return false;
    }

    return true;
  }

}
