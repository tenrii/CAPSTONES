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
  amenities: any[] = [];
  selectedFiles: any = FileList;
  images: { name: any; url: any }[] = [];;
  img: any[]=[];
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
      Amenities: [[], [Validators.required]],
      Details: [this.record.Details, [Validators.required]],
    });
    //this.record.Amenities.forEach((amenity: string) => {
    //  if (this.record.Amenities.includes(amenity)) {
    //    this.onChange({ target: { checked: true, value: amenity } });
     // }
   // });
  }

  onChange(event: any) {
    if (event.target.checked) {
      const am = this.amenities.findIndex((a: any) => a === event.target.value);
      if (am == -1) {
        this.amenities.push(event.target.value);
      }
    } else {
      const am = this.amenities.findIndex((a: any) => a === event.target.value);
      if (am >= 0) {
        this.amenities.splice(am, 1);
      }
    }
    this.roomForm.get('Amenities')?.setValue(this.amenities);
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
    this.firebaseService.update_room(this.record.id, this.roomForm.value);
    const newImages:any[] = [];
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
              newImages.push(url);
              if (newImages.length === this.selectedFiles.length) {
                // Combine new images with existing images
                const allImages = [...this.record.Images.map((image:any) => ({ name: image.name, url: image.url })), ...newImages];
                // Update the images array
                this.images = allImages;
                // Perform any necessary tasks with the updated images array
                this.afstore.collection('Room').doc(this.record.id).set({
                  Images: this.images,
                })
                // Dismiss the modal
                this.m.dismiss();
              }

            });
          })
        )
        .subscribe();
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
