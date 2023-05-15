import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DurationAgoPipe } from './duration-ago.pipe';


@NgModule({
  declarations: [DurationAgoPipe],
  imports: [
    CommonModule
  ],
  exports: [DurationAgoPipe]  
})
export class DurationAgoModule { }
