import { Injectable, NgZone } from '@angular/core';
import * as auth from 'firebase/auth';
import { User } from '../shared/user';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, lastValueFrom } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  id: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  userData: any;
  uid: any;
  downloadURL!: Observable<string>;

  constructor(
    public m: ModalController,
    public afStore: AngularFirestore,
    public ngFireAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    public storage: AngularFireStorage,
    public firebaseService: FirebaseService,
  ) {
    this.ngFireAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user') || '{}');
      } else {
        localStorage.setItem('user', '{}');
        JSON.parse(localStorage.getItem('user') || '{}');
      }
    });
  }
  // Login in with email/password
  SignIn(email:any, password:any) {
    return this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  SignInAdmin(email:any, password:any) {
    return this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  // Register user with email/password
  async SendVerificationMailT() {
    const user = await this.ngFireAuth.currentUser;
    await user!.sendEmailVerification();
  }

  async RegisterUserTenant(email: any, password: any, record: any) {
    try {
      const { user } = await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
      let emailVerified = user!.emailVerified;
      const uid = user!.uid;
      if (!emailVerified) {
      await this.SendVerificationMailT();
      while (!emailVerified) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay for 2 seconds
        await user!.reload();
        emailVerified = user!.emailVerified; // Update emailVerified variable
      }
    }
      await this.afStore.collection('Tenant').doc(uid).set({
        uid: uid,
        Email: record.Email,
        FName: record.FName,
        LName: record.LName,
        Age: record.Age,
        Gender: record.Gender,
        Address: record.Address,
      });
      await this.SignOut();
      await this.m.dismiss();
      await this.router.navigate(['home']);
      return user;
    } catch (error) {
      // Handle error
      //console.error(error);
      //throw error;
    }
  }


  async SendVerificationMailO() {
    const user = await this.ngFireAuth.currentUser;
    await user!.sendEmailVerification();
  }

  async RegisterUserOwner(email: any, password: any, record: any, BI:any, VI:any) {
    try {
      const { user } = await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
      let emailVerified = user!.emailVerified;
      const uid = user!.uid;
      if (!emailVerified) {
        await this.SendVerificationMailO();

        while (!emailVerified) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Delay for 2 seconds
          await user!.reload();
          emailVerified = user!.emailVerified; // Update emailVerified variable
        }
      }

      const filePathBP = `Owner/${uid}/${BI.name}`;
      const filePathVI = `Owner/${uid}/${VI.name}`;

      await this.storage.upload(filePathBP, BI);
      await this.storage.upload(filePathVI, VI);

      const fileRefBP = this.storage.ref(filePathBP);
      const fileRefVI = this.storage.ref(filePathVI);

      const bpDownloadURL = await lastValueFrom(fileRefBP.getDownloadURL());
      const viDownloadURL = await lastValueFrom(fileRefVI.getDownloadURL());

      await this.afStore.collection('Owner').doc(uid).set({
        uid: uid,
        Email: record.Email,
        FName: record.FName,
        LName: record.LName,
        Age: record.Age,
        Address: record.Address,
        BusinessPermit: bpDownloadURL || '',
        ValidID: viDownloadURL || '',
      });

      await this.SignOut();
      await this.m.dismiss();
      await this.router.navigate(['home']);
      return user;
    } catch (error) {
      // return this for testing/debugging
      // Handle error
      // console.error(error);
      // throw error;
    }
  }

  // Recover password
  PasswordRecover(passwordResetEmail: any) {
    return this.ngFireAuth
      .sendPasswordResetEmail(passwordResetEmail);
  }
  // Returns true when user is looged in
  get isLoggedIn(): boolean {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user !== null && user.emailVerified !== false ? true : false;
  }
  // Returns true when user's email is verified
  get isEmailVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.emailVerified !== false ? true : false;
  }

  get user(){
    const user = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
    return user
  }
  // Sign in with Gmail
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }
  // Auth providers
  AuthLogin(provider: any) {
    return this.ngFireAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['home']).then(() => {
            window.location.reload();
          });
        });
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  // Store user in localStorage
  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }
  // Sign-out
  SignOut(redirect = true) {
    return this.ngFireAuth.signOut().then(() => {
      localStorage.removeItem('user');
      if (redirect) {
        this.router.navigate(['home']).then(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    });
  }

  SignOutAdmin(redirect = true) {
    return this.ngFireAuth.signOut().then(() => {
      localStorage.removeItem('user');
      if (redirect) {
        window.location.reload();
      this.router.navigate(['admin-log']).then(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  });
  }
}
