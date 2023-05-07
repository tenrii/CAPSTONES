import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TenantPanelPage } from './tenant-panel.page';

const routes: Routes = [
  {
    path: '',
    component: TenantPanelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenantPanelPageRoutingModule {}
