import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-edit-owner-profile',
  templateUrl: './edit-owner-profile.component.html',
  styleUrls: ['./edit-owner-profile.component.scss'],
})
export class EditOwnerProfileComponent implements OnInit {
  public data: any;
  isButtonDisabled = false;
  updateForm!: FormGroup;
  currentPicture: any;
  selectedFile: any;

  constructor(
    public fb: FormBuilder,
    private m: ModalController,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.updateForm = this.fb.group({
      FName: [this.data?.FName, [Validators.required]],
      LName: [this.data?.LName, [Validators.required]],
      Age: [this.data?.Age, [Validators.required]],
      Gender: [this.data?.Gender, [Validators.required]],
      Address: [this.data?.Address, [Validators.required]],
      PhoneNum: [this.data?.PhoneNum, [Validators.required]],
      Birthday: [this.data?.Birthday, [Validators.required]],
    });
    console.log('zz', this.data);
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.previewPicture();
    }
  }

  previewPicture() {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.data.profpic = e.target.result;
    };
    reader.readAsDataURL(this.selectedFile as Blob);
  }

  exit() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    this.m.dismiss();
  }

  updateRoom() {
    this.firebaseService.update_owner(
      this.data?.id,
      this.updateForm.value,
      this.selectedFile
    );
    this.m.dismiss();
  }
}
