import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication-service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';


@Injectable({
  providedIn: "root"
})

export class AdminGuardService{
public adminUid:any[]=[]
  constructor(
    private router: Router,
    public ngFireAuth: AngularFireAuth,
    public authService: AuthenticationService,
  ) {

  }

  async canActivate(route: any, state: any) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
    console.log('user', state.url);

    if (!user && !this.authService.adminUid.includes(user)) {
      this.router.navigate(['/admin-log']);
      return false;
    }
    else{

    }

    return true;
  }

}
