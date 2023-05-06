import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../shared/authentication-service";
@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {

  constructor(
    public authService: AuthenticationService,
  ) {

  }

  ngOnInit() {}

}
