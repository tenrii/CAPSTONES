import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.page.html',
  styleUrls: ['./edit-room.page.scss'],
})
export class EditRoomPage implements OnInit {
  callable: any;
  emailData!: FormGroup;

  constructor(
    private fns: AngularFireFunctions,
    public fb: FormBuilder,
  ) {}

    ngOnInit(){
        this.emailData = this.fb.group({
          to: ['',[Validators.required]],
          subject: ['',[Validators.required]],
          text: ['',[Validators.required]],
        })
    }

  sendEmail() {
    this.callable = this.fns.httpsCallable('sendEmail');
    this.callable(this.emailData).subscribe(
      (response:any) => {
        console.log('Email sent successfully:', response);
        // Reset the form after successful email sending
        this.emailData.reset();
      },
      (error:any) => {
        console.error('Error sending email:', error);
      }
    );
}
}
