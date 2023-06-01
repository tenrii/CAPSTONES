import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
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
  uid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  isButtonDisabled = false;
  public record: any;
  roomForm!: FormGroup;
  roomData!: RoomData;
  selectedFiles: any = FileList;
  images: { name: any; url: any }[] = [];
  img: any[]=[];
  private initialImages: any[] = [];
  constructor(
    private afstore: AngularFirestore,
    public fb: FormBuilder,
    private m: ModalController,
    private firebaseService: FirebaseService,
    private storage: AngularFireStorage,
  ) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      Title: [this.record.Title, [Validators.required]],
      RoomName: [this.record.RoomName, [Validators.required]],
      RoomType: [this.record.RoomType, [Validators.required]],
      Rent: [this.record.Rent, [Validators.required]],
      Beds: [this.record.Beds, [Validators.required]],
      Street: [this.record.Street, [Validators.required]],
      Barangay: [this.record.Barangay, [Validators.required]],
      City: [this.record.City, [Validators.required]],
      Province: [this.record.Province, [Validators.required]],
      ZIP: [this.record.ZIP, [Validators.required]],
      Price: [this.record.Price, [Validators.required]],
      Amenities: [this.record.Amenities, [Validators.required]],
      Details: [this.record.Details, [Validators.required]],
    });
    //this.record.Amenities.forEach((amenity: string) => {
    //  if (this.record.Amenities.includes(amenity)) {
    //    this.onChange({ target: { checked: true, value: amenity } });
     // }
   // });
   this.initialImages = [...this.record.Images];
  }

  ifChange(event: any) {
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
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles.item(i);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.images.push({ name: file.name, url: reader.result?.toString() });
      };
    }
  }

  updateRoom() {
    const toUpdate = {
      ...this.roomForm.value,
    }
    console.log(this.record.Images, this.initialImages);
    if (this.initialImages !== this.record.Images) {
      toUpdate.Images = this.record.Images;
    }

    this.firebaseService.update_room(this.record.id, toUpdate);

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles.item(i);
      const path = `${this.uid}/Room/${Date.now()}_${file.name}`;
      const uploadTask = this.storage.upload(path, file);
      const ref = this.storage.ref(path);
      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(() => {
            const downloadURL = ref.getDownloadURL();
            downloadURL.subscribe((url: any) => {
              for(const img of this.record.Images){
                this.img.push(img);
              }
              this.img.push(url);
                this.afstore.collection('Room').doc(this.record.id).update({
                  Images: this.img,
                })
                this.m.dismiss();
            });
          })
        )
        .subscribe();
    }
  }

  removeImage(image: any) {
    if (typeof image === 'string') {
      this.record.Images.splice(this.record.Images.indexOf(image), 1);
    } else {
      this.images.splice(this.images.indexOf(image), 1);
    }
  }

  exit() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    this.m.dismiss();
  }

}
