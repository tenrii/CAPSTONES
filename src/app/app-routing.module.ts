import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {
  canActivate,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
} from '@angular/fire/compat/auth-guard';
import { AuthGuardService } from './shared/auth-guard.service';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
const redirectLoggedInToChat = () => redirectLoggedInTo(['/chat']);

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
    path: 'verify-email',
    loadChildren: () =>
      import('./verify-email/verify-email.module').then(
        (m) => m.VerifyEmailPageModule
      ),
  },

  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },

  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardPageModule),
  },

  {
    path: 'password-reset',
    loadChildren: () =>
      import('./password-reset/password-reset.module').then(
        (m) => m.PasswordResetPageModule
      ),
  },

  {
    path: 'test',
    loadChildren: () =>
      import('./test/test.module').then((m) => m.TestPageModule),
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
  },
  {
    path: 'ex',
    loadChildren: () => import('./ex/ex.module').then((m) => m.ExPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'ex2',
    loadChildren: () => import('./ex2/ex2.module').then((m) => m.Ex2PageModule),
    ...canActivate(redirectLoggedInToChat),
  },
  {
    path: 'ex3',
    loadChildren: () => import('./ex3/ex3.module').then((m) => m.Ex3PageModule),
  },
  {
    path: 'edit-room',
    loadChildren: () =>
      import('./edit-room/edit-room.module').then((m) => m.EditRoomPageModule),
  },
  {
    path: 'edit-room/:id',
    loadChildren: () =>
      import('./edit-room/edit-room.module').then((m) => m.EditRoomPageModule),
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
    path: 'tab1',
    loadChildren: () =>
      import('./components/tab1/tab1.module').then((m) => m.Tab1PageModule),
  },
  {
    path: 'owner-log-reg',
    loadChildren: () =>
      import('./owner-log-reg/owner-log-reg.module').then(
        (m) => m.OwnerLogRegPageModule
      ),
  },  {
    path: 'tenant-panel',
    loadChildren: () => import('./tenant-panel/tenant-panel.module').then( m => m.TenantPanelPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
