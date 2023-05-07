import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private auth: AngularFireAuth,
  ) { }

  async createPaymentSession(roomId: string, type: string | 'bedspace-reservation' | 'room-reservation', lineItems?: any) {
    const cu = await this.auth.currentUser;
    const idToken = await cu?.getIdToken()
    const res = await fetch('https://us-central1-cpstn-acb50.cloudfunctions.net/createPaymentSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        roomId,
        lineItems,
        type,
      })
    })
    return res.json();
  }
}
