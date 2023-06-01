import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './shared/auth-guard.service';
import { AdminGuardService } from './shared/admin-guard.service';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },

  {
    path: 'registration',
    loadChildren: () =>
      import('./registration/registration.module').then(
        (m) => m.RegistrationPageModule
      ),
  },

  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },


  {
    path: 'password-reset',
    loadChildren: () =>
      import('./password-reset/password-reset.module').then(
        (m) => m.PasswordResetPageModule
      ),
  },

  {
    path: 'room',
    loadChildren: () =>
      import('./room/room.module').then((m) => m.RoomPageModule),
  },

  {
    path: 'room/:id',
    loadChildren: () =>
      import('./room/room.module').then((m) => m.RoomPageModule),
  },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'owner-panel',
    loadChildren: () =>
      import('./owner-panel/owner-panel.module').then(
        (m) => m.OwnerPanelPageModule
      ),
    canActivate: [AuthGuardService],
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminPageModule),
      canActivate: [AdminGuardService],
  },

  {
    path: 'chatroom',
    loadChildren: () =>
      import('./chatroom/chatroom.module').then((m) => m.ChatroomPageModule),
    canActivate: [AuthGuardService],
  },
  {
    path: 'chatroom/:id',
    loadChildren: () =>
      import('./chatroom/chatroom.module').then((m) => m.ChatroomPageModule),
    canActivate: [AuthGuardService],
  },
  {
    path: 'owner-log-reg',
    loadChildren: () =>
      import('./owner-log-reg/owner-log-reg.module').then(
        (m) => m.OwnerLogRegPageModule
      ),
  },
  {
    path: 'tenant-panel',
    loadChildren: () => import('./tenant-panel/tenant-panel.module').then( (m) => m.TenantPanelPageModule),
    canActivate: [AuthGuardService],
  },
  {
    path: 'about-us',
    loadChildren: () => import('./about-us/about-us.module').then( (m) => m.AboutUsPageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./contact-us/contact-us.module').then( (m) => m.ContactUsPageModule)
  },
  {
    path: 'terms-condition',
    loadChildren: () => import('./terms-condition/terms-condition.module').then( (m) => m.TermsConditionPageModule)
  },
  {
    path: 'admin-log',
    loadChildren: () => import('./admin-log/admin-log.module').then( (m) => m.AdminLogPageModule)
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
