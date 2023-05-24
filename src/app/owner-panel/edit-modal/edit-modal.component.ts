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
  constructor(
    public fb: FormBuilder,
    private m: ModalController,
    private firebaseService: FirebaseService
  ) {}

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

  ifChange(event: any) {
    return this.record.Amenities.find((a: any) => a === event);
  }

  onChange(event: any) {
    const checked = event.target.checked;
    const value = event.target.value;

    if (checked) {
      const am = this.roomForm.get('Amenities')?.value;
      if (!am.includes(value)) {
        am.push(value);
        this.roomForm.get('Amenities')?.setValue(am);
      }
    } else {
      const am = this.roomForm.get('Amenities')?.value;
      const index = am.indexOf(value);
      if (index !== -1) {
        am.splice(index, 1);
        this.roomForm.get('Amenities')?.setValue(am);
      }
    }
  }

  updateRoom() {
    this.firebaseService.update_room(this.record.id, this.roomForm.value);
  }

  close() {
    this.m.dismiss();
  }
}
