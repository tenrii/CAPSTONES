import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/authentication-service';

@Component({
  selector: 'app-verify-owner',
  templateUrl: './verify-owner.component.html',
  styleUrls: ['./verify-owner.component.scss'],
})
export class VerifyOwnerComponent implements OnInit {

  constructor(
    public authService: AuthenticationService,
  ) { }

  ngOnInit() {}

}
