import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.page.html',
  styleUrls: ['./edit-room.page.scss'],
})
export class EditRoomPage {
  @Input() movieId!: string;
  @Input() reviews!: any[]; // Array of reviews to display
  @Input() avgRating!: number; // Average rating of the movie

  @Output() ratingChanged = new EventEmitter<number>(); // Emit the new rating
  @Output() reviewSubmitted = new EventEmitter<string>(); // Emit the new review

  review: string = '';

  constructor(private firebaseService: FirebaseService) {}

  onStarClick(rating: number) {
    // Emit the new rating
    this.ratingChanged.emit(rating);
  }

  onReviewSubmit() {
    // Add the new review to Firebase
    //this.firebaseService.addReview(this.movieId, this.review);

    // Emit the new review
    this.reviewSubmitted.emit(this.review);

    // Clear the textarea
    this.review = '';
  }
}
