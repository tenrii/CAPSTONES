import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
})
export class LogComponent implements OnInit {

  constructor(
    private m: ModalController,
  ) { }

  ngOnInit() {}

  closeModal() {
    this.m.dismiss();
  }

}
