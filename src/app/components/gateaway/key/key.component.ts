import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.scss'],
})
export class KeyComponent implements OnInit {
  issButtonDisabled = false;
  keyForm!:FormGroup;
  public ownerId:any;
  public key:any;
  constructor(
    private fb: FormBuilder,
    private m: ModalController,
    private afstore: AngularFirestore,
  ) { }

  ngOnInit() {
    this.keyForm = this.fb.group({
      SecretKey:[this.key,[Validators.required]],
    })
  }

  addKey(){
    this.afstore.collection('Owner').doc(this.ownerId).update(this.keyForm.value)
  }

  exit() {
    if (this.issButtonDisabled) {
      return;
    }
    this.issButtonDisabled = true;
    this.m.dismiss();
  }

}
