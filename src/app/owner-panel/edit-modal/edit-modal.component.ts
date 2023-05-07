import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
interface RoomData {
  Name: string;
  Price: number;
  Address: string;
  NumBedSpace: number;
  Detail: string;
  Available: number;
}

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
})
export class EditModalComponent implements OnInit {
  record: any;
  roomForm!: FormGroup;
  roomData!: RoomData;
  constructor(public fb: FormBuilder,
    private m: ModalController,
    private firebaseService: FirebaseService,) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      Title: [this.record.Title, [Validators.required]],
      Rent: [this.record.Rent, [Validators.required]],
      RoomType: [this.record.RoomType, [Validators.required]],
      Beds: [this.record.Beds, [Validators.required]],
      Street: [this.record.Street, [Validators.required]],
      Barangay: [this.record.Barangay, [Validators.required]],
      City: [this.record.City, [Validators.required]],
      Province: [this.record.Province, [Validators.required]],
      ZIP: [this.record.ZIP, [Validators.required]],
      Price: [this.record.Price, [Validators.required]],
      Amenities: [this.record.Amenities, [Validators.required]],
      Images: [this.record.Images, [Validators.required]],
      Details: [this.record.Details, [Validators.required]],
    });
  }

  ifChange(event: any){
    return this.record.Amenities.find((a: any) => a === event);
  }

  onChange(event: any) {
    if (event.target.checked) {
      const am = this.record.Amenities.findIndex((a: any) => a === event.target.value);
      if (am == -1) {
        this.record.Amenities.push(event.target.value);
      }
    } else {
      const am = this.record.Amenities.findIndex((a: any) => a === event.target.value);
      if (am >= 0) {
        this.record.Amenities.splice(am, 1);
      }
    }
    this.roomForm.get('Amenities')?.setValue(this.record.Amenities);
    console.log('a', this.record.Amenities);
  }

  updateRoom(){
    this.firebaseService.update_room(this.record.id, this.roomForm.value);
  }

  close(){
    this.m.dismiss();
  }
}
