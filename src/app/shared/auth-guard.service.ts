import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

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
    private router: Router,
    private firebaseService: FirebaseService,
  ) {
  }

  canActivate(route: any, state: any) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
    // console.log('user', state.url);

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
    //  else {
    //   this.router.navigate(['/home']);
    // }
    return user;
  }

}

