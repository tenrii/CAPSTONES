import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
    private firestore: AngularFirestore
  ) {
    this.firebaseService.read_owner().subscribe((data) => {
      this.ownerList = data;
    });
  }

  canActivate(route: any, state: any) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
    console.log('user', state.url);

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    } else if (this.ownerUid.includes(user) && state.url.includes('/login')) {
      this.router.navigate(['/home']);
      return false;
    } else if (
      this.firebaseService.tenantUid.includes(user) &&
      state.url.includes('/owner-panel')
    ) {
      this.router.navigate(['/home']);
      return false;
    } else {
      return true;
    }
  }
}
