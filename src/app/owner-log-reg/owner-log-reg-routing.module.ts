import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OwnerLogRegPage } from './owner-log-reg.page';

const routes: Routes = [
  {
    path: '',
    component: OwnerLogRegPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OwnerLogRegPageRoutingModule {}
