import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication-service';

@Injectable({
  providedIn: "root"
})

export class AdminGuardService{

  constructor(
    private router: Router,
    private authService: AuthenticationService,
  ) {

  }

  async canActivate(route: any, state: any) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
    if (!user) {
      this.router.navigate(['/admin-log'])
      return false;
    }
    else if(this.authService.user !== 'SDnrpKCCR2PeoNye2q1Bh44VryF3'){
      this.router.navigate(['/admin-log'])
      return false;
    }

    return user;
  }

}
