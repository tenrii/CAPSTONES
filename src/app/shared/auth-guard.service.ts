import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService } from '../services/firebase.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AdminLogPage } from '../admin-log/admin-log.page';
@Injectable({
  providedIn: 'root',
})

export class AuthGuardService {
  ownerList!: any[];
  ownerUid: any[] = [];
  tenantUid: any[] = [];
  userData: any;
  public a: any;
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firebaseService: FirebaseService,
    private firestore: AngularFirestore,
  ) {
  }

  canActivate(route: any, state: any) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
    console.log('user', state.url);

    if (!user) {
      this.router.navigate(['/home']);
      return false;
    } else if (
      this.firebaseService.ownerUid.includes(user) &&
      state.url.includes('/tenant-panel')) {
      this.router.navigate(['/home']);
      return false;
    } else if (
      this.firebaseService.tenantUid.includes(user) &&
      state.url.includes('/owner-panel')
    ) {
      this.router.navigate(['/home']);
      return false;
    }
     else {
      this.router.navigate(['/home']);
    }
    return user;
  }

}

